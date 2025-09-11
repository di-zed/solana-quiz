docker-restart:
	docker-compose stop && docker-compose up -d

docker-local-stop:
	docker-compose -f docker-compose.yml -f docker-compose.local.yml stop

docker-local-up:
	docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d

docker-local-restart: docker-local-stop docker-local-up