require 'git'
require 'confidante'
require 'rake_terraform'
require 'ruby_terraform/output'
require 'rake_docker'
require 'rake_fly'
require 'rake_gpg'
require 'rake_factory/kernel_extensions'
require 'shivers'

configuration = Confidante.configuration
version = Shivers::Version.from_file('build/version')

Docker.options = {
  read_timeout: 300
}

RakeFly.define_installation_tasks(version: '6.7.2')
RakeTerraform.define_installation_tasks(
  path: File.join(Dir.pwd, 'vendor', 'terraform'),
  version: '0.15.4')

task :default => [
  :build_fix,
  :test
]

task :build => [
  :"app:lint",
  :"app:format",
  :"tests:app:lint",
  :"tests:app:format"
]

task :build_fix => [
  :"app:lint_fix",
  :"app:format_fix",
  :"tests:app:lint_fix",
  :"tests:app:format_fix"
]

namespace :keys do
  namespace :app do
    namespace :passphrase do
      task :generate do
        File.open('config/secrets/app/gpg.passphrase', 'w') do |f|
          f.write(SecureRandom.base64(36))
        end
      end
    end

    namespace :gpg do
      RakeGPG.define_generate_key_task(
          output_directory: 'config/secrets/app',
          name_prefix: 'gpg',
          armor: false,
          owner_name: 'Leptonite Maintainers',
          owner_email: 'maintainers@leptonite.io',
          owner_comment: 'Service key'
      ) do |t|
        t.passphrase =
            File.read('config/secrets/app/gpg.passphrase')
      end
    end

    task generate: %w[passphrase:generate gpg:generate]
  end
end

task :test, [:deployment_type, :deployment_label] do |_, args|
  [
    :'tests:app:unit',
    :'tests:app:persistence',
    :'tests:app:component'
  ].each do |task_name|
    Rake::Task[task_name].invoke(*args)
  end
end

namespace :secrets do
  desc 'Check if secrets are readable'
  task :check do
    if File.exist?('config/secrets')
      puts 'Checking if secrets are accessible.'
      unless File.read('config/secrets/.unlocked').strip == "true"
        raise RuntimeError, Paint['Cannot access secrets.', :red]
      end
      puts 'Secrets accessible. Continuing.'
    end
  end

  desc 'Unlock secrets'
  task :unlock do
    if File.exist?('config/secrets')
      puts 'Unlocking secrets.'
      sh('git crypt unlock')
    end
  end
end

namespace :app do
  namespace :dependencies do
    desc "Install all app dependencies"
    task :install do
      sh('npm', 'install')
    end
  end

  desc "Lint all app sources"
  task :lint => [:'dependencies:install'] do
    sh('npm', 'run', 'app:lint')
  end

  desc "Lint & fix all app source"
  task :lint_fix => [:'dependencies:install'] do
    sh('npm', 'run', 'app:lint-fix')
  end

  desc "Format all app sources"
  task :format => [:'dependencies:install'] do
    sh('npm', 'run', 'app:format')
  end

  desc "Format & fix all app sources"
  task :format_fix => [:'dependencies:install'] do
    sh('npm', 'run', 'app:format-fix')
  end

  desc "Run the app as a local process"
  task :run => [:'dependencies:install', :'database:local:provision'] do
    configuration = configuration
      .for_scope(
        deployment_type: 'local',
        deployment_label: 'development',
        role: 'local-app'
      )

    environment = configuration
      .environment
      .map { |k, v| [k.to_s, v] }
      .to_h

    sh(environment, 'npm', 'run', 'start')
  end
end

namespace :functions do
  namespace :dependencies do
    desc "Install all functions dependencies"
    task :install do
      Dir.chdir('external/lambdas') do
        sh('npm', 'install')
      end
    end
  end

  desc "Lint all function sources"
  task :lint => [:'dependencies:install'] do
    Dir.chdir('external/lambdas') do
      sh('npm', 'run', 'functions:lint')
    end
  end

  desc "Lint & fix all app source"
  task :lint_fix => [:'dependencies:install'] do
    Dir.chdir('external/lambdas') do
      sh('npm', 'run', 'functions:lint-fix')
    end
  end

  desc "Format all app sources"
  task :format => [:'dependencies:install'] do
    Dir.chdir('external/lambdas') do
      sh('npm', 'run', 'functions:format')
    end
  end

  desc "Format & fix all app sources"
  task :format_fix => [:'dependencies:install'] do
    Dir.chdir('external/lambdas') do
      sh('npm', 'run', 'functions:format-fix')
    end
  end
end

namespace :bootstrap do
  RakeTerraform.define_command_tasks(
    configuration_name: 'bootstrap infrastructure',
    argument_names: [:deployment_type, :deployment_label]) do |t, args|
    configuration = configuration
      .for_scope(args.to_h.merge(role: 'bootstrap'))

    deployment_identifier = configuration.deployment_identifier
    vars = configuration.vars

    t.source_directory = 'infra/bootstrap'
    t.work_directory = 'build'

    t.state_file =
      File.join(
        Dir.pwd, "state/bootstrap/#{deployment_identifier}.tfstate")
    t.vars = vars
  end
end

namespace :database do
  namespace :test do
    RakeDocker.define_container_tasks(
      container_name: 'reference-backend-test-database') do |t|
      configuration = configuration
        .for_scope(
          deployment_type: 'local',
          deployment_label: 'testing')

      t.image = "mongo:#{configuration.database_version}"
      t.ports = ["#{configuration.database_port}:27017"]
      t.environment = [
        "MONGO_INITDB_ROOT_USERNAME=#{configuration.database_username}",
        "MONGO_INITDB_ROOT_PASSWORD=#{configuration.database_password}",
      ]
    end
  end

  namespace :local do
    RakeDocker.define_container_tasks(
      container_name: 'reference-backend-local-database') do |t|
      configuration = configuration
        .for_scope(
          deployment_type: 'local',
          deployment_label: 'development')

      t.image = "mongo:#{configuration.database_version}"
      t.ports = ["#{configuration.database_port}:27017"]
      t.environment = [
        "MONGO_INITDB_ROOT_USERNAME=#{configuration.database_username}",
        "MONGO_INITDB_ROOT_PASSWORD=#{configuration.database_password}",
      ]
    end
  end

  namespace :environment do
    RakeTerraform.define_command_tasks(
      configuration_name: 'database',
      argument_names: [:deployment_type, :deployment_label]) do |t, args|
      configuration = configuration
        .for_scope(args.to_h.merge(role: 'database'))

      vars = configuration.vars
      backend_config = configuration.backend_config

      t.source_directory = 'infra/database'
      t.work_directory = 'build'

      t.vars = vars
      t.backend_config = backend_config
    end
  end

  namespace :contextual do
    task :ensure, [:deployment_type, :deployment_label] do |_, args|
      args.with_defaults(
        deployment_type: 'local',
        deployment_label: 'testing')

      database_type = configuration
        .for_scope(args.to_h)
        .database_type
      task_name = (database_type == 'deployed') ?
        'database:environment:provision' :
        'database:test:provision'

      Rake::Task[task_name].invoke(*args)
    end
  end
end

namespace :tests do
  namespace :app do
    desc "Lint all tests"
    task :lint => [:'app:dependencies:install'] do
      sh('npm', 'run', 'tests:app:lint')
    end

    desc "Lint & fix all tests"
    task :lint_fix => [:'app:dependencies:install'] do
      sh('npm', 'run', 'tests:app:lint-fix')
    end

    desc "Format all test files"
    task :format => [:'app:dependencies:install'] do
      sh('npm', 'run', 'tests:app:format')
    end

    desc "Format & fix all test files"
    task :format_fix => [:'app:dependencies:install'] do
      sh('npm', 'run', 'tests:app:format-fix')
    end

    desc "Run all unit tests"
    task :unit => [:'app:dependencies:install'] do
      script_name = ENV["INCLUDE_COVERAGE"] == 'true' ?
        'tests:app:unit:coverage' :
        'tests:app:unit'
      sh('npm', 'run', script_name)
    end

    desc "Run all integration tests"
    task :integration => [:'app:dependencies:install'] do
      configuration = configuration
        .for_scope(
          deployment_type: 'local',
          deployment_label: 'testing',
          role: 'integration-tests'
        )

      environment = configuration
        .environment
        .map { |k, v| [k.to_s, v] }
        .to_h

      sh(environment, 'npm', 'run', 'tests:app:integration')
    end

    desc "Run all persistence tests"
    task :persistence,
         [:deployment_type, :deployment_label] =>
           [:'app:dependencies:install'] do |_, args|
      args.with_defaults(
        deployment_type: 'local',
        deployment_label: 'testing')

      Rake::Task['database:contextual:ensure'].invoke(*args)

      script_name = ENV["INCLUDE_COVERAGE"] == 'true' ?
        'tests:app:persistence:coverage' :
        'tests:app:persistence'
      sh(database_overrides_for(configuration, args),
         'npm', 'run', script_name)
    end

    desc "Run all component tests"
    task :component,
         [:deployment_type, :deployment_label] =>
           [:'app:dependencies:install'] do |_, args|
      args.with_defaults(
        deployment_type: 'local',
        deployment_label: 'testing')

      Rake::Task['database:contextual:ensure'].invoke(*args)

      script_name = ENV["INCLUDE_COVERAGE"] == 'true' ?
        'tests:app:component:coverage' :
        'tests:app:component'
      sh(database_overrides_for(configuration, args),
         'npm', 'run', script_name)
    end

    namespace :coverage do
      desc "Run coverage badge creation"
      task :badge => [:'app:dependencies:install'] do |_, args|
        sh('npm', 'run', 'tests:coverage:badge')
      end
    end
  end
end

namespace :lambda do
  RakeTerraform.define_command_tasks(
    configuration_name: 'reference backend keepers lambda',
    argument_names: %i[deployment_type deployment_label]
  ) do |t, args|
    configuration =
      configuration.for_scope(args.to_h.merge(role: 'functions'))

    t.source_directory = 'infra/functions'
    t.work_directory = 'build'

    t.backend_config = configuration.backend_config
    t.vars = configuration.vars
  end
end

namespace :keepers_image_repository do
  RakeTerraform.define_command_tasks(
    configuration_name: 'keepers image repository',
    argument_names: %i[deployment_type deployment_label]
  ) do |t, args|
    configuration =
      configuration.for_scope(args.to_h.merge(role: 'keepers-image-repository'))

    t.source_directory = 'infra/keepers-image-repository'
    t.work_directory = 'build'

    t.backend_config = configuration.backend_config
    t.vars = configuration.vars
  end
end

namespace :triggers_image_repository do
  RakeTerraform.define_command_tasks(
    configuration_name: 'triggers image repository',
    argument_names: %i[deployment_type deployment_label]
  ) do |t, args|
    configuration =
      configuration.for_scope(args.to_h.merge(role: 'triggers-image-repository'))

    t.source_directory = 'infra/triggers-image-repository'
    t.work_directory = 'build'

    t.backend_config = configuration.backend_config
    t.vars = configuration.vars
  end
end

namespace :image_repository do
  RakeTerraform.define_command_tasks(
    configuration_name: 'reference backend image repository',
    argument_names: %i[deployment_type deployment_label]
  ) do |t, args|
    configuration =
      configuration.for_scope(args.to_h.merge(role: 'image-repository'))

    t.source_directory = 'infra/image-repository'
    t.work_directory = 'build'

    t.backend_config = configuration.backend_config
    t.vars = configuration.vars
  end
end

namespace :image do
  RakeDocker.define_image_tasks(
    image_name: 'reference-backend',
    argument_names: %i[deployment_type deployment_label]
  ) do |t, args|
    configuration =
      configuration.for_scope(args.to_h.merge(role: 'image-repository'))

    t.work_directory = 'build/images'

    t.copy_spec = [
      'image/Dockerfile',
      'image/docker-entrypoint.sh',
      'src/',
      'app.js',
      'package.json',
      'package-lock.json'
    ]
    t.create_spec = [
      { content: version.to_s, to: 'VERSION' },
      { content: version.to_docker_tag, to: 'TAG' }
    ]

    t.repository_name = configuration.image_repository_name
    t.repository_url = dynamic do
      JSON.parse(
        RubyTerraform::Output.for(
          name: 'repository_url',
          source_directory: 'infra/image-repository',
          work_directory: 'build',
          backend_config: configuration.backend_config
        )
      )
    end

    t.credentials = dynamic do
      RakeDocker::Authentication::ECR.new do |c|
        c.region = configuration.region
        c.registry_id =
          JSON.parse(
            RubyTerraform::Output.for(
              name: 'registry_id',
              source_directory: 'infra/image-repository',
              work_directory: 'build',
              backend_config: configuration.backend_config
            )
          )
      end.call
    end

    t.tags = [version.to_docker_tag, 'latest']
  end
end

namespace :image_keepers do
  RakeDocker.define_image_tasks(
    image_name: 'keepers',
    argument_names: %i[deployment_type deployment_label]
  ) do |t, args|
    configuration =
      configuration.for_scope(args.to_h.merge(role: 'keepers-image-repository'))

    t.work_directory = 'build/images'

    t.copy_spec = [
      'image-keepers/Dockerfile',
      'image-keepers/docker-entrypoint.sh',
      'external/keepers/src/',
      'external/keepers/package.json',
      'external/keepers/package-lock.json'
    ]
    t.create_spec = [
      { content: version.to_s, to: 'VERSION' },
      { content: version.to_docker_tag, to: 'TAG' }
    ]

    t.repository_name = configuration.keepers_image_repository_name
    t.repository_url = dynamic do
      JSON.parse(
        RubyTerraform::Output.for(
          name: 'repository_url',
          source_directory: 'infra/keepers-image-repository',
          work_directory: 'build',
          backend_config: configuration.backend_config
        )
      )
    end

    t.credentials = dynamic do
      RakeDocker::Authentication::ECR.new do |c|
        c.region = configuration.region
        c.registry_id =
          JSON.parse(
            RubyTerraform::Output.for(
              name: 'registry_id',
              source_directory: 'infra/keepers-image-repository',
              work_directory: 'build',
              backend_config: configuration.backend_config
            )
          )
      end.call
    end

    t.tags = [version.to_docker_tag, 'latest']
  end
end

namespace :image_triggers do
  RakeDocker.define_image_tasks(
    image_name: 'triggers',
    argument_names: %i[deployment_type deployment_label]
  ) do |t, args|
    configuration =
      configuration.for_scope(args.to_h.merge(role: 'triggers-image-repository'))

    t.work_directory = 'build/images'

    t.copy_spec = [
      'image-triggers/Dockerfile',
      'image-triggers/docker-entrypoint.sh',
      'external/triggers/abis/',
      'external/triggers/config/',
      'external/triggers/local/',
      'external/triggers/src/',
      'external/triggers/index.js',
      'external/keepers/package.json',
      'external/keepers/package-lock.json'
    ]
    t.create_spec = [
      { content: version.to_s, to: 'VERSION' },
      { content: version.to_docker_tag, to: 'TAG' }
    ]

    t.repository_name = configuration.keepers_image_repository_name
    t.repository_url = dynamic do
      JSON.parse(
        RubyTerraform::Output.for(
          name: 'repository_url',
          source_directory: 'infra/triggers-image-repository',
          work_directory: 'build',
          backend_config: configuration.backend_config
        )
      )
    end

    t.credentials = dynamic do
      RakeDocker::Authentication::ECR.new do |c|
        c.region = configuration.region
        c.registry_id =
          JSON.parse(
            RubyTerraform::Output.for(
              name: 'registry_id',
              source_directory: 'infra/keepers-image-repository',
              work_directory: 'build',
              backend_config: configuration.backend_config
            )
          )
      end.call
    end

    t.tags = [version.to_docker_tag, 'latest']
  end
end

namespace :image_storage_bucket do
  RakeTerraform.define_command_tasks(
      configuration_name: 'reference backend image storage bucket',
      argument_names: %i[deployment_type deployment_label]
  ) do |t, args|
    configuration =
        configuration.for_scope(args.to_h.merge(role: 'image-storage-bucket'))

    t.source_directory = 'infra/image-storage-bucket'
    t.work_directory = 'build'

    t.backend_config = configuration.backend_config
    t.vars = configuration.vars
  end
end

namespace :service do
  RakeTerraform.define_command_tasks(
    configuration_name: 'reference backend',
    argument_names: %i[deployment_type deployment_label]
  ) do |t, args|
    version_configuration = { version_number: version.to_docker_tag }
    service_configuration =
      configuration
        .for_overrides(version_configuration)
        .for_scope(args.to_h.merge(role: 'service'))

    t.source_directory = 'infra/service'
    t.work_directory = 'build'

    t.backend_config = service_configuration.backend_config
    t.vars = service_configuration.vars
  end
end

namespace :service_keepers do
  RakeTerraform.define_command_tasks(
    configuration_name: 'keepers',
    argument_names: %i[deployment_type deployment_label]
  ) do |t, args|
    version_configuration = { version_number: version.to_docker_tag }
    service_configuration =
      configuration
        .for_overrides(version_configuration)
        .for_scope(args.to_h.merge(role: 'keepers-service'))

    t.source_directory = 'infra/keepers-service'
    t.work_directory = 'build'

    t.backend_config = service_configuration.backend_config
    t.vars = service_configuration.vars
  end
end

namespace :ci do
  RakeFly.define_authentication_tasks(
    namespace: :authentication,
    argument_names: [
      :ci_deployment_type,
      :ci_deployment_label
    ]) do |t, args|
    configuration = configuration
      .for_scope(args.to_h)

    t.target = configuration.concourse_team
    t.concourse_url = configuration.concourse_url
    t.team = configuration.concourse_team
    t.username = configuration.concourse_username
    t.password = configuration.concourse_password

    t.home_directory = 'build/fly'
  end

  namespace :pipeline do
    RakeFly.define_pipeline_tasks(
      namespace: :develop,
      argument_names: [
        :ci_deployment_type,
        :ci_deployment_label
      ]
    ) do |t, args|
      configuration = configuration
        .for_scope(args.to_h.merge(role: 'develop-pipeline'))
      ci_deployment_type = configuration.ci_deployment_identifier

      t.target = configuration.concourse_team
      t.team = configuration.concourse_team
      t.pipeline = "reference-backend-develop"

      t.config = 'pipelines/develop/pipeline.yaml'

      t.vars = configuration.vars
      t.var_files = [
        'config/secrets/pipeline/constants.yaml',
        "config/secrets/pipeline/#{ci_deployment_type}.yaml"
      ]

      t.non_interactive = true
      t.home_directory = 'build/fly'
    end

    RakeFly.define_pipeline_tasks(
      namespace: :poc,
      argument_names: [
        :ci_deployment_type,
        :ci_deployment_label
      ]
    ) do |t, args|
      configuration = configuration
        .for_scope(args.to_h.merge(role: 'poc-pipeline'))
      ci_deployment_type = configuration.ci_deployment_identifier

      t.target = configuration.concourse_team
      t.team = configuration.concourse_team
      t.pipeline = "reference-backend-poc"

      t.config = 'pipelines/poc/pipeline.yaml'

      t.vars = configuration.vars
      t.var_files = [
        'config/secrets/pipeline/constants.yaml',
        "config/secrets/pipeline/#{ci_deployment_type}.yaml"
      ]

      t.non_interactive = true
      t.home_directory = 'build/fly'
    end

    RakeFly.define_pipeline_tasks(
      namespace: :demo,
      argument_names: [
        :ci_deployment_type,
        :ci_deployment_label
      ]
    ) do |t, args|
      configuration = configuration
        .for_scope(args.to_h.merge(role: 'demo-pipeline'))
      ci_deployment_type = configuration.ci_deployment_identifier

      t.target = configuration.concourse_team
      t.team = configuration.concourse_team
      t.pipeline = "reference-backend-demo"

      t.config = 'pipelines/demo/pipeline.yaml'

      t.vars = configuration.vars
      t.var_files = [
        'config/secrets/pipeline/constants.yaml',
        "config/secrets/pipeline/#{ci_deployment_type}.yaml"
      ]

      t.non_interactive = true
      t.home_directory = 'build/fly'
    end

    RakeFly.define_pipeline_tasks(
      namespace: :production,
      argument_names: [
        :ci_deployment_type,
        :ci_deployment_label
      ]
    ) do |t, args|
      configuration = configuration
        .for_scope(args.to_h.merge(role: 'tag-pipeline'))
      ci_deployment_type = configuration.ci_deployment_identifier

      t.target = configuration.concourse_team
      t.team = configuration.concourse_team
      t.pipeline = "reference-backend-production"

      t.config = 'pipelines/tag/pipeline.yaml'

      t.vars = configuration.vars
      t.var_files = [
        'config/secrets/pipeline/constants.yaml',
        "config/secrets/pipeline/#{ci_deployment_type}.yaml"
      ]

      t.non_interactive = true
      t.home_directory = 'build/fly'
    end

    RakeFly.define_pipeline_tasks(
      namespace: :builder,
      argument_names: [
        :ci_deployment_type,
        :ci_deployment_label]
    ) do |t, args|
      configuration = configuration
        .for_scope(args.to_h.merge(role: 'builder-pipeline'))
      ci_deployment_type = configuration.ci_deployment_identifier

      t.target = configuration.concourse_team
      t.team = configuration.concourse_team
      t.pipeline = "reference-backend-builder"

      t.config = 'pipelines/builder/pipeline.yaml'

      t.vars = configuration.vars
      t.var_files = [
        'config/secrets/pipeline/constants.yaml',
        "config/secrets/pipeline/#{ci_deployment_type}.yaml"
      ]

      t.non_interactive = true
      t.home_directory = 'build/fly'
    end

    namespace :pr do
      RakeFly.define_pipeline_tasks(
        argument_names: [
          :ci_deployment_type,
          :ci_deployment_label,
          :branch
        ]
      ) do |t, args|
        branch = args.branch || pr_metadata_branch

        configuration = configuration
          .for_scope(args.to_h.merge(role: 'pr-pipeline'))
          .for_overrides(source_repository_branch: branch)

        ci_deployment_type = configuration.ci_deployment_identifier

        t.target = configuration.concourse_team
        t.team = configuration.concourse_team
        t.pipeline = "reference-backend-pr-#{to_pipeline_name(branch)}"

        t.config = 'pipelines/pr/pipeline.yaml'

        t.vars = configuration.vars
        t.var_files = [
          'config/secrets/pipeline/constants.yaml',
          "config/secrets/pipeline/#{ci_deployment_type}.yaml"
        ]

        t.non_interactive = true
        t.home_directory = 'build/fly'
      end

      task :handle, [
        :ci_deployment_type,
        :ci_deployment_label,
        :branch,
        :state
      ] do |_, args|
        branch = args.branch || pr_metadata_branch
        state = args.state || pr_metadata_state

        if state == "OPEN"
          Rake::Task[:"ci:pipeline:pr:push"].invoke(
            args.ci_deployment_type,
            args.ci_deployment_label,
            branch)
        else
          Rake::Task[:"ci:pipeline:pr:destroy"].invoke(
            args.ci_deployment_type,
            args.ci_deployment_label,
            branch)
        end
      end
    end
  end

  namespace :pipelines do
    desc "Push all pipelines"
    task :push, [:ci_deployment_type, :ci_deployment_label] do |_, args|
      Rake::Task[:"ci:pipeline:develop:push"].invoke(*args)
      Rake::Task[:"ci:pipeline:poc:push"].invoke(*args)
      Rake::Task[:"ci:pipeline:demo:push"].invoke(*args)
      Rake::Task[:"ci:pipeline:builder:push"].invoke(*args)
    end
  end
end

def pr_metadata_value(key)
  File.exist?(".git/resource/#{key}") ?
    File.read(".git/resource/#{key}") :
    nil
end

def pr_metadata_branch
  pr_metadata_value("head_name")
end

def pr_metadata_state
  pr_metadata_value("state")
end

def current_branch
  Git.open(File.dirname(__FILE__)).current_branch
end

def to_db_name(string)
  string.gsub(/[^a-zA-Z0-9_-]/, "")
end

def to_pipeline_name(string)
  string.gsub(/[^a-zA-Z0-9_-]/, "_")
end

def database_overrides_for(configuration, args)
  configuration = configuration
    .for_scope(args.to_h.merge(role: 'database'))

  (configuration.database_type == 'deployed') ?
    {
      "DB_CONNECTION_STRING" =>
        RubyTerraform::Output.for(
          name: 'connection_string',
          source_directory: 'infra/database',
          work_directory: 'build',
          backend_config: configuration.backend_config),
      "DB_USERNAME" => configuration.database_username,
      "DB_PASSWORD" => configuration.database_password,
      "DB_NAME" => to_db_name(current_branch)
    } :
    {}
end
