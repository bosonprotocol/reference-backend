require 'rake_docker'
require 'confidante'
require 'rake_fly'

configuration = Confidante.configuration

RakeFly.define_installation_tasks(version: '6.7.2')

task :default => [
    :build_fix,
    :test
]

task :build => [
    :"app:lint",
    :"app:format",
    :"functions:lint",
    :"functions:format"
]

task :build_fix => [
    :"app:lint_fix",
    :"app:format_fix",
    :"functions:lint_fix",
    :"functions:format_fix"
]

task :test => [
    :'tests:app:unit',
    :'tests:app:persistence',
    :'tests:app:component'
]

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
end

namespace :tests do
  namespace :app do
    desc "Run all component tests"
    task :unit do
      sh('npm', 'run', 'tests:app:unit')
    end

    desc "Run all persistence tests"
    task :persistence => [:"database:test:provision"] do
      sh('npm', 'run', 'tests:app:persistence')
    end

    desc "Run all component tests"
    task :component => [:"database:test:provision"] do
      sh('npm', 'run', 'tests:app:component')
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
      t.pipeline = "contracts-master"

      t.config = 'pipelines/master/pipeline.yaml'

      t.vars = configuration.vars
      t.var_files = [
          'config/secrets/pipeline/constants.yaml',
          "config/secrets/pipeline/#{ci_deployment_type}.yaml"
      ]

      t.non_interactive = true
      t.home_directory = 'build/fly'
    end
  end
end