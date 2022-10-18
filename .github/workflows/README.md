# API-DEPLOY 

This readme describes the deployment process of the GitHub Actions Workflow defined in the [deploy.yml](deploy.yml) file.  

Read about GitHub Actions workflows here:
https://docs.github.com/en/actions/using-workflows/about-workflows

The Workflow is separated into 2 jobs called build-deploy-web, and build-deploy-docs. These jobs will be executed based on the configuration at the top of the file. Here we are instructing GitHub Actions workflows to execute the workflow on a successful push to the main branch, or on an approved pull request into the main branch.  

note: *this may be changed in the future to support feature branch deployments.*

```yaml
on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]
```

<br/>

## build-deploy-web

Following is a brief explanation for each step in this build job, and the GitHub and Digital Ocean configuration required for a successful deployment.


The first line in this job defines the docker runner image that the build will be executed on. 
We are choosing the very common Ubuntu image.
```yaml
    runs-on: ubuntu-latest
```

The next step uses a GitHub Action called 'checkout' to pull in the project from the GitHub Repository that is executing this Actions Workflow. No configuration is necessary to execute this Action. 
```yaml
    - name: Checking out Project 
      uses: actions/checkout@v3
```

The next step calls on the 'setup-node' Action to install a node runtime at the specified version.
```yaml
    - name: Use Setup Node.js [18.x]
      uses: actions/setup-node@v3
      with:
        node-version: 18.x
        cache: 'npm'
```

This step simply installs the node dependencies defined in the projects root package.json.
```yaml
    - name: Installing Dependencies
      run: npm ci   
```

The next step executes the 'npm run build', a script defined in the root [package.json](../../package.json) file.
```yaml
    - name: Building Project
      run: npm run build
```

The following step executes `npm test`, a script defined in the root [package.json](../../package.json)
```yaml
    - name: Running Tests
      run: npm test
```

The following step builds the docker image from the [Dockerfile](../../Dockerfile) in the project root. <br/>
The run command calls docker build and references a GitHub secret named `DIGITALOCEAN_FULLY_QUALIFIED_CONTAINER_NAME`.
This secret defines the fully qualified registry/container name. 

Read about GitHub secrets here: https://docs.github.com/en/actions/security-guides/encrypted-secrets.

This value stored as a repository secret defines the name of the container registry and image name that will be the target for the image deployment in a subsequent step.

Here we are building the image and tagging it with the fully qualified image name for the target registry. 
```yaml
    - name: Building Docker Image
      run: docker build -t ${{ secrets.DIGITALOCEAN_FULLY_QUALIFIED_CONTAINER_NAME }} . 
```

This step installs the Digital Ocean developed GitHub Action [digitalocean/action-doctl@v2](https://github.com/digitalocean/action-doctl). 

The Action wraps Digital Oceans [doctl](https://docs.digitalocean.com/reference/doctl/) cli utility for use in GitHub Actions workflows.

We are using the doctl action here to authenticate to the Digital Ocean api, push our image, and in later steps to deploy the web app.

Note the use of another GitHub Actions secret `DIGITAL_OCEAN_ACCESS_TOKEN`. This secret defines the Digital Ocean Access Token    
created in the Digital Ocean UI here: https://cloud.digitalocean.com/account/api/.
```yaml
    - name: Install doctl
      uses: digitalocean/action-doctl@v2
      with:
        token: ${{ secrets.DIGITAL_OCEAN_ACCESS_TOKEN }}  
```

The next step logs into the Digital Ocean Container registry using the previously defined Access Token.
No other configuration is required.
```yaml
    - name: Login to DigitalOcean Container Registry
      run: doctl registry login
```

This step pushes the newly created docker image to the Container Registry.
The run command references the image previously created by its fully qualified image name. 
```yaml
    - name: Push Container into Registry
      run: docker push ${{ secrets.DIGITALOCEAN_FULLY_QUALIFIED_CONTAINER_NAME }} 
```

The last step of this job deploys the App Service using the doctl utility.
We wait for a deployment before determining success. 
```yaml
    - name: Deploy Web App
      run: doctl apps create-deployment ${{ secrets.DIGITAL_OCEAN_APP_ID }} --force-rebuild --wait=true --no-header 
```

Note: the Digital Ocean Web App must be configured prior to deploying.
The following defines the minimum configuration necessary for a successful deployment.

1.  Set the DBURI environment variable on the Web App
    This is a valid connection string for connecting to the managed cluster found in the managed database settings.

2.  Set the HealthCheck endpoint.
    Under the Web App healthcheck config setting must be set to /v1/util/healthcheck, and the the type of api set to http. 

3.  Set the Container Port.
    Under the Web App port config setting change the port number to match the port the application is set to listen on (3000 as of the time of writing)

<br/><br/>
## build-deploy-docs

This build job runs concurrently with the previous job, and builds, and deploys the code generated documentation for the Api Project.  

Again we choose `Ubuntu` as the build image.

```yaml
    runs-on: ubuntu-latest
```

The first step uses the checkout Action just like the previous job.
```yaml
      - name: Checking out Project
        uses: actions/checkout@v3
```

Again we use the `setup-node` Action to install node
```yaml
      - name: Use Setup Node.js [18.x]
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
          cache: 'npm'
```

Install the project dependencies
```yaml
      - name: Installing Dependencies
        run: npm ci 
```

This step executes `npm run doc` an npm script defined in [package.json](../../package.json).
This generates the html documentation website in the ./doc directory.
```yaml
      - name: Generating Documentation
        run: npm run doc
```

And the final step utilizes a 3rd party Github Action called [github-action-push-to-another-repository](https://github.com/cpina/github-action-push-to-another-repository).

This Action handles the details of pushing the static documentation files into another GitHub repository.

Note there are 5 GitHub Action Secrets used in this step that must be defined in the api repository settings.

`API_DOCS_REPO_DEPLOY_KEY` 
This secret defines the private deploy key attached to the documentation repository. 
Read about deploy keys here: https://docs.github.com/en/developers/overview/managing-deploy-keys.

`API_DOCS_REPO_USER`
Defines the Documentation Repository User to use when pushing.

`API_DOCS_REPO_NAME`
Defines the name of the Documentation Repository.

`API_DOCS_REPO_EMAIL`
Defines the email for the Repository User used to push the commit. 

`API_DOCS_REPO_BRANCH`
Defines the branch to push the Documentation commit into.


TODO: *update the username, and user-email to match the account who triggered this deployment.*

```yaml
      - name: Pushes to another repository
        uses: cpina/github-action-push-to-another-repository@main
        env:
          SSH_DEPLOY_KEY: ${{ secrets.API_DOCS_REPO_DEPLOY_KEY }}
        with:
          source-directory: 'doc'
          destination-github-username: ${{ secrets.API_DOCS_REPO_USER }}
          destination-repository-name: ${{ secrets.API_DOCS_REPO_NAME }}
          user-email: ${{ secrets.API_DOCS_REPO_USER }}@githubworkflow.com
          target-branch: main
```
