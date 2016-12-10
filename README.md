# SingleHealth

#### Instalar node utilizando PPA (ubuntu):

* `curl -sL https://deb.nodesource.com/setup | sudo bash -`
* `sudo apt-get install nodejs npm`
* `sudo apt-get install build-essential`

#### Configuração:
  
Vá até uma pasta qualquer e nela rode o comando:

* `express SingleHealth`
 
e logo em seguida, sobrescrever para a pasta recém criada: 

 app.js, ./views/*,  package.json 

* `sudo npm install -g express`  

* `sudo npm install -g nodemon`

* `npm install`

* `psql mydatabase < node_modules/connect-pg-simple/table.sql` 
 
ou via GUI, executar a criação da tabela node_modules/connect-pg-simple/table.sql
 
 
#### Instalação e configuração do mongodb: 
 O repositório 10gen fornece o pacote mongodb-10gen, que contém a última versão estável.

 `sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10`
 
 `echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/10gen.list`
 
 `sudo apt-get update`

 `sudo apt-get install mongodb-10gen`
 
 Rodar o mongodb:
 
 `sudo service mongodb start`
 
 `sudo service mongodb stop`
 
 `sudo service mongodb restart`
 
####  Finalmente rodar a aplicação:
 
 `nodemon app.js`
