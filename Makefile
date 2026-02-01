.PHONY: init
init: webapp/sql/dump.sql.bz2 benchmarker/userdata/img

webapp/sql/dump.sql.bz2:
	cd webapp/sql && \
	curl -L -O https://github.com/catatsuy/private-isu/releases/download/img/dump.sql.bz2

benchmarker/userdata/img.zip:
	cd benchmarker/userdata && \
	curl -L -O https://github.com/catatsuy/private-isu/releases/download/img/img.zip

benchmarker/userdata/img: benchmarker/userdata/img.zip
	cd benchmarker/userdata && \
	unzip -qq -o img.zip


# PHP用の追加設定をする
php:
	cd ./webapp && \
	docker compose down && \
	mv ./etc/nginx/conf.d/default.conf ./etc/nginx/conf.d/default.conf.org && \
	mv ./etc/nginx/conf.d/php.conf.org ./etc/nginx/conf.d/php.conf && \
	docker compose up --build
