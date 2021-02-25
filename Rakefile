require 'git'
require 'confidante'
require 'rake_docker'
require 'rake_terraform'
require 'ruby_terraform/output'
require 'rake_fly'

configuration = Confidante.configuration

RakeFly.define_installation_tasks(version: '6.7.2')
RakeTerraform.define_installation_tasks(
    path: File.join(Dir.pwd, 'vendor', 'terraform'),
    version: '0.14.7')

task :default => [
    :build_fix,
    :test
]

task :build => [
    :"app:lint",
    :"app:format",
    :"functions:lint",
    :"functions:format",
    :"tests:app:lint",
    :"tests:app:format"
]

task :build_fix => [
    :"app:lint_fix",
    :"app:format_fix",
    :"functions:lint_fix",
    :"functions:format_fix",
    :"tests:app:lint_fix",
    :"tests:app:format_fix"
]

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
end

namespace :functions do
  namespace :dependencies do
    desc "Install all functions dependencies"
    task :install do
      Dir.chdir('functions') do
        sh('npm', 'install')
      end
    end
  end

  desc "Lint all function sources"
  task :lint => [:'dependencies:install'] do
    Dir.chdir('functions') do
      sh('npm', 'run', 'functions:lint')
    end
  end

  desc "Lint & fix all app source"
  task :lint_fix => [:'dependencies:install'] do
    Dir.chdir('functions') do
      sh('npm', 'run', 'functions:lint-fix')
    end
  end

  desc "Format all app sources"
  task :format => [:'dependencies:install'] do
    Dir.chdir('functions') do
      sh('npm', 'run', 'functions:format')
    end
  end

  desc "Format & fix all app sources"
  task :format_fix => [:'dependencies:install'] do
    Dir.chdir('functions') do
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

    desc "Run all component tests"
    task :unit => [:'app:dependencies:install'] do
      sh('npm', 'run', 'tests:app:unit')
    end

    desc "Run all persistence tests"
    task :persistence,
        [:deployment_type, :deployment_label] =>
            [:'app:dependencies:install'] do |_, args|
      args.with_defaults(
          deployment_type: 'local',
          deployment_label: 'testing')

      Rake::Task['database:contextual:ensure'].invoke(*args)

      sh(database_overrides_for(configuration, args),
          'npm', 'run', 'tests:app:persistence')
    end

    desc "Run all component tests"
    task :component,
        [:deployment_type, :deployment_label] =>
            [:'app:dependencies:install'] do |_, args|
      args.with_defaults(
          deployment_type: 'local',
          deployment_label: 'testing')

      Rake::Task['database:contextual:ensure'].invoke(*args)

      sh(database_overrides_for(configuration, args),
          'npm', 'run', 'tests:app:component')
    end
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
        t.pipeline = "reference-backend-pr-#{branch}"

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
          "DB_NAME" => current_branch
      } :
      {}
end
