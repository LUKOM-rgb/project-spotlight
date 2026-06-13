# Project Spotlight

Este projeto é uma aplicação web para gestão e acompanhamento de atuações de rua ("spots" de artistas).
É composto por um backend em Node.js com uma base de dados relacional e um frontend moderno desenhado com Vue.js 3 e Tailwind CSS.

## 🛠️ Tecnologias

- **Frontend:** Vue.js 3, Tailwind CSS, Vite
- **Backend:** Node.js, Express
- **Base de Dados:** MySQL / Sequelize

## 🚀 Como executar o projeto localmente

### 1. Requisitos
- [Node.js](https://nodejs.org/) instalado
- Base de dados a correr localmente

### 2. Instalação e Execução

Para iniciar o projeto em modo de desenvolvimento (o servidor Vite já tem um proxy configurado para comunicar automaticamente com o backend em `/api`):

```bash
# Instalar as dependências do Frontend
npm install

# Iniciar o servidor de desenvolvimento Frontend
npm run dev
```

*(Nota: Certifique-se de que o backend também está a correr na porta `3000` para que o frontend consiga aceder aos dados através do proxy `/api`)*

---
*Projeto desenvolvido de raiz, baseado numa interface administrativa inicialmente fornecida por JustBoil.*
