.PHONY:  FORCE clean dist docker build

clean:
	@rm -rf build
	@rm -rf node_modules
	@rm -rf ali-iot-config
	@rm -rf *.zip

ifndef VERSION
VERSION=$(shell git describe --tags --first-parent)
endif

build:
	@echo "Building ${VERSION}"
	@npm run build

dist: build
	@ln -s build ali-iot-config
	@zip -r ali-iot-config-${VERSION}.zip ali-iot-config/

docker: build
	@cp Dockerfile build/
	@docker build -t d.artifactory.maxtropy.com/ali-iot-config:${VERSION} -f Dockerfile build/
