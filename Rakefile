require 'rake_docker'
require 'confidante'

configuration = Confidante.configuration

task :default => [
    :build_fix,
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
