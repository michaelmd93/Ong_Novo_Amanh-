
# Projeto BETA - Sistema da ONG Novo Amanhã

Este é um sistema web em desenvolvimento para a gestão da ONG Novo Amanhã.

## ✅ Funcionalidades já implementadas

- Cadastro simulado de alunos
- Registro de presença (chamada)
- Dashboard com métricas (alunos, salas, presença)
- Controle de doações
- Documentos em nuvem (upload e listagem simulada)
- Galeria de fotos com upload local
- Calendário com eventos simulados
- Guia do usuário com boas práticas
- Tela de primeiro acesso
- Navegação funcional entre todas as páginas

## 📁 Estrutura de pastas

```
PI/
├── index.html
├── css/
│   └── global.css
├── js/
│   └── [scripts por página]
├── data/
│   └── simulacoes.js
├── utils/
│   └── default.js
├── assets/
│   └── avatar1.png (e outros avatares/logos)
├── img/
│   └── (fotos da galeria)
└── pages/
    ├── menu.html
    ├── alunos.html
    ├── chamada.html
    ├── dashboard.html
    ├── doacoes.html
    ├── documentos.html
    ├── galeria.html
    ├── guia.html
    ├── calendario.html
    ├── primeiroacesso.html
    ├── sala-presenca.html
```

## 💻 Como testar localmente

1. Baixe o projeto
2. Extraia o conteúdo
3. Abra o arquivo `index.html` com um navegador moderno (Chrome, Edge, Firefox)
4. Navegue livremente entre as páginas
5. Os dados são salvos no **localStorage** e mantidos entre sessões

## 📦 Simulações

Todos os dados (alunos, doações, documentos, presença etc.) são armazenados localmente usando o navegador.
Eles podem ser acessados via `localStorage` na aba DevTools.

## 🛠️ Requisitos

- Navegador moderno com suporte a ES6+
- Nenhum servidor ou backend necessário

## 🚫 Ainda não implementado

- Sistema de login e permissões
- Logs e auditoria
- Integração com banco de dados real (ex: Firebase)
- Assistente virtual e configurações flutuantes

---

Este projeto é mantido e desenvolvido para fins institucionais e educacionais.
