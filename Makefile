help:
	@echo "Liste des commandes disponibles :"
	@grep -E '^[1-9a-zA-Z_-]+(\.[1-9a-zA-Z_-]+)?:.*?## .*$$|(^#--)' $(MAKEFILE_LIST) \
	| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m %-43s\033[0m %s\n", $$1, $$2}' \
	| sed -e 's/\[32m #-- /[33m/'

#-- GIT
clean-merged-branches: ## Supprime les branches mergées
	git branch --merged | grep -v '\*\|master\|dev\|prod\|main\|test' | xargs -n 1 git branch -d
	git branch -r --merged | grep -v '\*\|master\|dev\|prod\|main\|test' | sed 's/origin\///' | xargs -n 1 git push --delete origin

#-- COMPONENTS
component.add: ## Ajoute un composant de shadcn
	npx shadcn-ui@latest add 

#-- DOCKER
docker.build: ## Build docker image
	docker build --platform=linux/amd64 -t template-backoffice:latest .  

docker.tag: ## Tag docker image
	docker tag template-backoffice:latest noephilippe/template-backoffice:latest

docker.push: ## Push docker image
	docker push noephilippe/template-backoffice:latest

docker.new: ## Build, tag and push docker image
	make docker.build
	make docker.tag
	make docker.push

#-- DEPLOY
deploy: ## Deploy on server
	ansible-playbook -i inventory.ini deploy.yml