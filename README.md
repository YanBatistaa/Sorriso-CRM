# Syncro CRM

**Copyright © 2025 Dellion corp. Todos os direitos reservados.**

## 1. Visão Geral

O Syncro CRM é um sistema de Customer Relationship Management (CRM) B2B, desenvolvido sob medida para otimizar a gestão de clínicas e consultórios odontológicos. A plataforma centraliza o gerenciamento do funil de vendas, desde o primeiro contato até a conversão do paciente, e oferece ferramentas para a administração eficiente da base de clientes.

Este software é um produto comercial e de uso interno. A reprodução, distribuição ou engenharia reversa do código-fonte é estritamente proibida.

---

## 2. Status do Projeto

**Versão Atual:** 1.0.0 (Em Desenvolvimento)
**Ambiente Principal:** `main` (Produção)
**Ambiente de Staging:** `develop` (Homologação)

---

## 3. Funcionalidades Implementadas

* **Dashboard Analítico:** Visualização de KPIs essenciais, como receita mensal, novos pacientes e taxa de conversão.
* **Gestão de Pacientes (CRUD):** Cadastro, visualização, edição e exclusão de pacientes com um layout responsivo.
* **Funil de Vendas (Kanban):** Quadro visual para gerenciamento do fluxo de vendas com estágios personalizáveis e funcionalidade de arrastar e soltar.
* **Autenticação Segura:** Sistema de login para acesso controlado à plataforma.
* **Formulários Inteligentes:** Máscaras de entrada e validações para dados como CPF e Telefone.

---

## 4. Stack de Tecnologias

* **Frontend:** React 18, TypeScript, Vite
* **Estilização:** Tailwind CSS com componentes `radix-ui` e `shadcn/ui`
* **Backend & Banco de Dados:** Supabase (PostgreSQL, Auth, Realtime)
* **Gerenciamento de Estado:** React Query
* **Drag and Drop:** React Beautiful DnD

---

## 5. Guia de Instalação e Execução Local

Este guia destina-se a desenvolvedores autorizados a trabalhar no projeto.

### 5.1. Pré-requisitos

* [Node.js](https://nodejs.org/) (versão recomendada: 20.x)
* Acesso ao projeto do Supabase.

### 5.2. Configuração do Ambiente

1.  **Clonar o Repositório:**
    ```sh
    git clone [URL_DO_REPOSITORIO]
    cd syncro-crm
    ```

2.  **Instalar Dependências:**
    ```sh
    npm install
    ```

3.  **Configurar Variáveis de Ambiente:**
    * Crie uma cópia do arquivo `.env.example` e renomeie para `.env`.
    * Preencha as variáveis de ambiente com as chaves do seu projeto Supabase.

### 5.3. Executando o Projeto

Para iniciar o servidor de desenvolvimento local, execute:

```sh
npm run dev
