// ---------------------------------------------------------------------------
// Pipeline for github.com/YushinB/Mediumizer
//
// Copy this file into the ROOT of that repository as `Jenkinsfile`, then commit
// and push. The `sample-github-pipeline` job looks for it on the `main` branch.
//
// Tailored to what the repo actually contains: TypeScript, Vite + esbuild,
// building to dist/. There is no test script yet, so the pipeline type-checks
// instead - that is the real quality signal available today.
// ---------------------------------------------------------------------------

pipeline {
    agent any

    options {
        timestamps()
        ansiColor('xterm')
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
    }

    environment {
        REGISTRY   = "${env.DOCKER_REGISTRY ?: 'registry:5000'}"
        IMAGE_NAME = 'mediumizer'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_SHA   = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_SHA}"
                }
                echo "Building ${env.GIT_BRANCH} at ${env.GIT_SHA}"
            }
        }

        stage('Install') {
            // Debian-based rather than Alpine: esbuild ships prebuilt binaries
            // per libc, and the musl variant is a common source of install
            // failures. reuseNode keeps the workspace shared across stages.
            agent {
                docker {
                    image 'node:22-bookworm-slim'
                    reuseNode true
                }
            }
            steps {
                // The repo has bun.lock but no package-lock.json, so `npm ci`
                // cannot run. To use bun instead, swap the agent image for
                // 'oven/bun:1' and this command for 'bun install --frozen-lockfile'.
                sh 'npm install --no-audit --no-fund'
            }
        }

        stage('Type check') {
            agent {
                docker {
                    image 'node:22-bookworm-slim'
                    reuseNode true
                }
            }
            steps {
                sh 'npx tsc --noEmit'
            }
        }

        stage('Build') {
            agent {
                docker {
                    image 'node:22-bookworm-slim'
                    reuseNode true
                }
            }
            steps {
                sh 'npm run build'
                sh 'ls -la dist/'
            }
        }

        stage('Archive') {
            steps {
                archiveArtifacts artifacts: 'dist/**',
                                 allowEmptyArchive: false,
                                 fingerprint: true
            }
        }

        // Activates automatically once you add a Dockerfile to the repo.
        stage('Docker image') {
            when { expression { return fileExists('Dockerfile') } }
            steps {
                sh '''
                    set -eu
                    docker build -t "$REGISTRY/$IMAGE_NAME:$IMAGE_TAG" \
                                 -t "$REGISTRY/$IMAGE_NAME:latest" .
                    docker push "$REGISTRY/$IMAGE_NAME:$IMAGE_TAG"
                    docker push "$REGISTRY/$IMAGE_NAME:latest"
                    echo "Pushed $REGISTRY/$IMAGE_NAME:$IMAGE_TAG"
                '''
            }
        }
    }

    post {
        success { echo "Build ${env.BUILD_NUMBER} succeeded - artifacts archived from dist/." }
        failure { echo "Build ${env.BUILD_NUMBER} failed - see the console log above." }
        cleanup { cleanWs() }
    }
}
