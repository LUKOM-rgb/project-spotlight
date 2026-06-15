# Project Spotlight

O **SpotLight** é uma aplicação web geográfica concebida para a gestão, acompanhamento e reserva automatizada de locais de atuação (spots) para artistas de rua, garantindo a conformidade com os regulamentos municipais e permitindo a validação de licenças em tempo real.
---

## Tecnologias e Stack

- **Frontend:** Vue.js 3, Tailwind CSS, Vite, Leaflet.js (Mapas)
- **Backend:** Node.js, Express, JSON Web Tokens (JWT)
- **Base de Dados:** MySQL com Sequelize ORM
- **Garantia de Qualidade:** Selenium (Automação UI) e Testes de API

---

## Como Executar o Projeto Localmente

### 1. Pré-requisitos
* [Node.js](https://nodejs.org/) instalado.
* Instância do [MySQL Server](https://www.mysql.com/) ativa localmente.
* Ligação ativa à EduVPN / Rede da ESMAD: A base de dados do projeto está alojada num servidor interno (172.22.0.201). É obrigatório estar ligado à VPN da escola para que a aplicação se consiga conectar com sucesso.

---

### 2. Configuração e Execução do Backend

1. Navegue até à pasta do servidor:
   ```bash
   cd backend

2. Configure o ficheiro de ambiente
Crie um ficheiro .env na raiz da pasta backend/ seguindo o modelo abaixo

  ```markdown
  NODE_ENV=development

  #informação da base de dados do nosso grupo
  DB_HOST=172.22.0.201
  DB_USER=g14
  DB_PASSWORD="jQ8D#}E2{L"
  DB_DIALECT=mysql
  DB_NAME=Grupo14
  DB_PORT=3306

  JWT_SECRET="chave_secreta_super_segura_esmad"
  PORT=3000
```

### 3. Como ligar o Backend
Com as credenciais configuradas no .env, o servidor Node.js pode ser iniciado para processar os pedidos da API.

1. Garante que estás dentro da pasta do backend
   ```bash
   cd backend

2. Instala as dependências do servidor
   ```bash
   npm install

3. Inicia o servidor executando o Node diretamente sobre o ficheiro principal da aplicação
   ```bash
   node src/app.js

>A documentação API encontra-se na pasta /WebPII_2526 _Grupo_14_Anexos
### 4. Como ligar o Frontend
O frontend corre separado na raiz do repositório e comunica com o backend através de um proxy reverso já configurado no Vite.

1. Abre um novo terminal na raiz do repositório (fora da pasta backend)

2. Instala as dependências da interface
   ```bash
   npm install

3. Inicia o servidor de desenvolvimento do ecossistema Vue
   ```bash
   npm run dev

### 5. Como Executar os Testes Automatizados
O repositório inclui uma suite de testes automatizados na pasta test/ para validar fluxos críticos como login de artistas, conflitos de reservas, integridade e acessibilidade (Lighthouse).

Para testar os pedidos e scripts do repositório, o backend e o frontend têm de estar obrigatoriamente ligados em segundo plano.

1. Abre um novo terminal na raiz do repositório

2. Executa o Node diretamente sobre o script de teste que pretendes validar. Exemplo:
   - Testar Fluxo de Reserva de um Spot
   ```bash
   node test/fluxo_reserva/test_reserva_spot.js

### 6. Equipa de Desenvolvimento
- Gonçalo Duarte
- Lucas Silva
- Sérgio Gonçalves

### 7. Credencias de Diversos Perfils


1. ADMIN

nome_utilizador: ADMIN
email: admingoncalo@email.com
password: admin1

2. ARTISTA

nome_utilizador: TesteGoncalo
email: testegoncalo@email.com
password: teste1

3. UTILIZADOR

nome_utilizador: Johny20
email: johny20@email.com
password: johny1

>Interface administrativa baseada no template fornecido por JustBoil.

