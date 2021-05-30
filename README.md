# express-locallibrary-tutorial

Site feito com Express/Node.js seguindo o "Tutorial para criar o site de uma Biblioteca Local" do MDN.

## Informações MDN

### Links do MDN
[Acesse a página de Tutorial do MDN](https://developer.mozilla.org/pt-BR/docs/Learn/Server-side/Express_Nodejs/Tutorial_local_library_website).

[Acesse o repositório do MDN](https://github.com/mdn/express-locallibrary-tutorial).

### Diagrama de classes do MDN
![](https://github.com/mdn/express-locallibrary-tutorial/blob/master/public/images/Library%20Website%20-%20Mongoose_Express.png)

## Visão do site

![Screenshot from 2021-05-29 22-29-19](https://user-images.githubusercontent.com/72050839/120089081-63324680-c0cd-11eb-9c42-b0988d349e2e.png)
![Screenshot from 2021-05-29 22-29-32](https://user-images.githubusercontent.com/72050839/120089083-64637380-c0cd-11eb-9169-df01b5bbe2be.png)
![Screenshot from 2021-05-29 22-29-42](https://user-images.githubusercontent.com/72050839/120089085-6594a080-c0cd-11eb-980a-dd82e84d4628.png)

## Começo rápido 
(Traduzido e adaptado do [README.md do MDN](https://github.com/mdn/express-locallibrary-tutorial/blob/master/README.md))

Para colocar este projeto em execução localmente em seu computador:

1. Configure um ambiente de desenvolvimento [Nodejs](https://developer.mozilla.org/pt-BR/docs/Learn/Server-side/Express_Nodejs/development_environment).
2. A biblioteca usa um banco de dados MongoDb padrão hospedado no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Você deve usar um banco de dados diferente para seus próprios experimentos de código. Em app.js substitua ```var mongoDB = process.env.MONGODB_URI;``` pelo seu link do banco de dados ([Tutorial MDN para Configurar o banco de dados MongoDB](https://developer.mozilla.org/pt-BR/docs/Learn/Server-side/Express_Nodejs/mongoose#configurando_o_banco_de_dados_mongodb)) ou implemente sua própria variável de ambiente ([Tutorial MDN para deploy no Heroku e configuração de variável de ambiente](https://developer.mozilla.org/pt-BR/docs/Learn/Server-side/Express_Nodejs/deployment#example_installing_locallibrary_on_heroku)).
4. Cole os seguintes comandos na raíz do seu clone deste repositório
   ```
   npm install
   DEBUG=express-locallibrary-tutorial:* npm start   #Para Linux
   ```
1. Abra um navegador em  http://localhost:3000/ para abrir o site da biblioteca.
