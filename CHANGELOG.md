# [2.1.0](https://github.com/NelakaWith/faq-chatbot/compare/v2.0.0...v2.1.0) (2026-04-06)


### Features

* **arg:** implement RAG-enabled chat controller and PDF embedding scripts ([975893b](https://github.com/NelakaWith/faq-chatbot/commit/975893b1039110376e470986611c39ec2425d7db))
* **chat:** implement legal document title formatting and add multi-provider chat controller support ([68b4157](https://github.com/NelakaWith/faq-chatbot/commit/68b4157646d88398282259533b9e0743e299d2cd))
* **embeddings:** implement search service with hybrid vector and full-text search capabilities for FAQ and legal documentation ([e5561f6](https://github.com/NelakaWith/faq-chatbot/commit/e5561f698a07ad22e0f07840548487dd81fe84e3))
* **vectors:** implement RAG-enabled chatbot backend with multi-provider LLM support and frontend chat interface ([29b75b8](https://github.com/NelakaWith/faq-chatbot/commit/29b75b86fe0312b481de276d51111d3a08d32a0a))

# [2.0.0](https://github.com/NelakaWith/faq-chatbot/compare/v1.4.0...v2.0.0) (2026-01-27)


### Features

* **chat-header:** add icons for LLM and KB modes in chat header ([9359a6c](https://github.com/NelakaWith/faq-chatbot/commit/9359a6c3826c2c60b0b7a7d49c82dfa5a11a3135))
* **chat-header:** update chat title to use dynamic prop for improved flexibility ([67e841f](https://github.com/NelakaWith/faq-chatbot/commit/67e841fe9ff548bcc3865a9617a1e72fa6ffb5bd))
* **chat:** add typing indicator animations and styles for enhanced user experience ([e756410](https://github.com/NelakaWith/faq-chatbot/commit/e7564104e24545d2c03e1ebbc3178f56f9bfd235))
* **chat:** allow file upload in both knowledge base and LLM modes ([d938be8](https://github.com/NelakaWith/faq-chatbot/commit/d938be8882300952175aef49b7df4d06aff8f892))
* **chat:** enhance LLM message handling with document context retrieval and mode switching ([c2f066e](https://github.com/NelakaWith/faq-chatbot/commit/c2f066ecaf7378c104e01b8f47e0709c8c797198))
* **chat:** implement markdown rendering for bot messages with sanitization ([1fead3f](https://github.com/NelakaWith/faq-chatbot/commit/1fead3f974d319cd91deb3852e0721ab99047e4a))
* **chat:** reintroduce RAG routes and enhance document processing feedback ([66fb626](https://github.com/NelakaWith/faq-chatbot/commit/66fb62618f80903741d79c0bc071199c77be4ebe))
* **data:** enhance data loading and chunk management for PDF documents ([6e6c7fb](https://github.com/NelakaWith/faq-chatbot/commit/6e6c7fb922f494ea9c93555d8c2d46315327c08e))
* **dependencies:** downgrade marked to version 12.0.2 and specify node engine requirement ([f19d63f](https://github.com/NelakaWith/faq-chatbot/commit/f19d63f1a1e89bc5fbfe862433ae9dfc88f08b4d))
* **file-upload:** enhance PDF file validation and error handling in file upload component ([35ad73c](https://github.com/NelakaWith/faq-chatbot/commit/35ad73cbbd2a5ac7980090b731a70f28ac8d1808))
* **rag:** add multer error handling middleware for improved file upload feedback ([f0a3e75](https://github.com/NelakaWith/faq-chatbot/commit/f0a3e75d0daccf46760d884a07f66844763dc34a))
* **rag:** enhance document upload validation and error handling ([edf4ad8](https://github.com/NelakaWith/faq-chatbot/commit/edf4ad89f398ade2645f04b247977b9b7c963428))
* **rag:** enhance PDF processing and implement semantic chunking for improved text extraction ([038d4d8](https://github.com/NelakaWith/faq-chatbot/commit/038d4d8b1f2d5729a7baf0e7b8b0eab8531dc167))
* **rag:** enhance PDF processing with page tracking and chunk mapping for improved text extraction ([5402862](https://github.com/NelakaWith/faq-chatbot/commit/540286202d56095d80adaac8217c0d0842b60d9a))
* **rag:** implement chunk management and cleanup for uploaded PDF documents ([ea1b9b4](https://github.com/NelakaWith/faq-chatbot/commit/ea1b9b4e838a8dc1ef3e43cfe64cbe432b4f3420))
* **rag:** implement PDF upload and processing functionality with knowledge base mode ([e23f382](https://github.com/NelakaWith/faq-chatbot/commit/e23f3826137f97d34356a9355ba11f66a76ee1b3))
* **rag:** improve PDF file type validation and error handling in multer middleware ([9b839ea](https://github.com/NelakaWith/faq-chatbot/commit/9b839ea2c252800904609fbf068a9db25e666dc3))
* **style:** implement dark theme palette and enhance UI components for improved aesthetics ([a8ba141](https://github.com/NelakaWith/faq-chatbot/commit/a8ba141b14e6a3e68d02e387a012785445bde54d))


### BREAKING CHANGES

* **style:**

# [1.4.0](https://github.com/NelakaWith/faq-chatbot/compare/v1.3.1...v1.4.0) (2026-01-20)


### Bug Fixes

* **deploy:** update deployment script to handle directory existence check more robustly ([07337d2](https://github.com/NelakaWith/faq-chatbot/commit/07337d2f4c845e50129582c850a175592f002d4b))
* **env:** update example API keys and configuration for clarity ([ce5e7fd](https://github.com/NelakaWith/faq-chatbot/commit/ce5e7fd3fa06320067c44b62c8364c9e5c325ad8))


### Features

* **chat:** add default LLM dispatcher and update chat routes for improved provider handling ([25dd77a](https://github.com/NelakaWith/faq-chatbot/commit/25dd77a1107a7ab850067ccfe94071efb4746926))
* **chat:** add validation for Gemini API base URL in chat handler ([d5ca487](https://github.com/NelakaWith/faq-chatbot/commit/d5ca487bbb95f56bd0a70c8e5a89a843351031e6))
* **chat:** enhance Groq chat error handling with sanitized response details ([5d57657](https://github.com/NelakaWith/faq-chatbot/commit/5d576579357ec28ea12d3d8f78b3b51ad611b329))
* **chat:** enhance Groq chat handler with input validation and error handling ([cc7078e](https://github.com/NelakaWith/faq-chatbot/commit/cc7078e17350a51cb64e16e2d0757ab8a4abc7a7))
* **chat:** integrate Groq API for chat completions and update UI components ([606f9e3](https://github.com/NelakaWith/faq-chatbot/commit/606f9e3ffae6b2fbd1ceba8097666a2e4677f8dd))
* **chat:** streamline message handling by using conversation history directly in LLM mode ([2a3923a](https://github.com/NelakaWith/faq-chatbot/commit/2a3923a9b4e4486cee0d92f90b612f1368d9dc8f))
* **deploy:** enhance backend deployment with process backup and error recovery ([71bfe1c](https://github.com/NelakaWith/faq-chatbot/commit/71bfe1c44491d0aa150d661d932bcc65059402c7))
* **readme:** update default chat mode to LLM-powered chat with API key configuration ([cfe07a9](https://github.com/NelakaWith/faq-chatbot/commit/cfe07a92426012eb6a137753c749d470fc41acba))
* **readme:** update default chat mode to LLM-powered chat with API key requirements ([49bf415](https://github.com/NelakaWith/faq-chatbot/commit/49bf4158a8d2211dbb6fd1e891164ba13c4c703a))

## [1.3.1](https://github.com/NelakaWith/faq-chatbot/compare/v1.3.0...v1.3.1) (2025-11-02)


### Bug Fixes

* **deploy:** improve repository cloning and deployment logic in workflow ([aa790c8](https://github.com/NelakaWith/faq-chatbot/commit/aa790c8f277414c6cc17946c3cecb883151a3f5f))
* **package:** reorder dependencies in package.json for consistency ([a32cd71](https://github.com/NelakaWith/faq-chatbot/commit/a32cd71ee0aa8ba9e930d270ee4d79427ad3bc7b))

# [1.3.0](https://github.com/NelakaWith/faq-chatbot/compare/v1.2.0...v1.3.0) (2025-11-02)


### Bug Fixes

* **app:** update paths from 'dev/' to 'frontend/' and 'backend/' across project files ([44f9db5](https://github.com/NelakaWith/faq-chatbot/commit/44f9db58e0b8f17dcf73c31fa8828e5966b327e7))
* **ci_install:** separate installation messages and verify semantic-release plugins ([99c5111](https://github.com/NelakaWith/faq-chatbot/commit/99c51118b95f5a2a459a428d03f47b68969aaf23))
* **ci:** add conditional semantic-release execution for pull requests ([c5b1d0f](https://github.com/NelakaWith/faq-chatbot/commit/c5b1d0fd059efd786d062ea36003b396dc46ff0e))
* **ci:** allow spaces in PR title scope validation regex ([28a3660](https://github.com/NelakaWith/faq-chatbot/commit/28a36608a16efd0098e4bac446527ae5762ca8e4))
* **ci:** make PR title validation more permissive and add debugging ([1dae6d6](https://github.com/NelakaWith/faq-chatbot/commit/1dae6d68b66c670c52ea8edf94d547cf20ba9879))
* **ci:** reorganize permissions and streamline release workflow steps ([3b14613](https://github.com/NelakaWith/faq-chatbot/commit/3b14613962c470de659209c78cc556624755269a))
* **ci:** resolve husky and commitlint installation issues ([e18b22f](https://github.com/NelakaWith/faq-chatbot/commit/e18b22f8d6f469cad8f7eb6113314f384da208df))
* **ci:** trim whitespace from PR title before validation ([63ca2e7](https://github.com/NelakaWith/faq-chatbot/commit/63ca2e7a25acff28bf278ae6b4b02747c649bcd1))
* **ci:** update Node.js setup and enhance semantic-release verification steps ([6b58882](https://github.com/NelakaWith/faq-chatbot/commit/6b588820318a75d81def871aad5f5f87e07e6af4))
* **ci:** update semantic-release execution method to use local binary ([647e128](https://github.com/NelakaWith/faq-chatbot/commit/647e12847bcc0762f0e87cd481108dfadb21691d))
* **ci:** update semantic-release execution to use npm script ([6219973](https://github.com/NelakaWith/faq-chatbot/commit/62199732aba8513131bc846cd9e62535312b0bef))
* **ci:** update semantic-release verification steps and change execution method ([07a2582](https://github.com/NelakaWith/faq-chatbot/commit/07a25822f85da311ea9c4df82262a78e1b040634))
* **ci:** use --no-install flag for npx semantic-release to ensure local plugins are found ([c465b22](https://github.com/NelakaWith/faq-chatbot/commit/c465b225347be85519f95f5f3a48af029355e9b3))
* **ci:** use --no-install flag for semantic-release and add verification step ([a9e9a89](https://github.com/NelakaWith/faq-chatbot/commit/a9e9a89dc2722cae2e5a91454f022144ac1e77b5))
* **deploy:** update npm install commands to ensure consistent dependency installation ([e828fee](https://github.com/NelakaWith/faq-chatbot/commit/e828fee507b345b837a2454848ecf1188f98e5ba))
* **release:** ensure release job runs only on main branch ([ddfc4d0](https://github.com/NelakaWith/faq-chatbot/commit/ddfc4d0ab670d08b32087cbbc309ce85cc9c513e))
* **release:** install semantic-release and commitlint dependencies at root level for CI/CD ([8d406db](https://github.com/NelakaWith/faq-chatbot/commit/8d406dbc2d13c1accc765ff9fa7fae7c82dea287))
* **release:** update semantic-release commands to use npm scripts ([36faae9](https://github.com/NelakaWith/faq-chatbot/commit/36faae9d7d595057286b1658d4499dc361921560))


### Features

* **ci:** add semantic-release configuration for automated versioning and changelog generation ([233f7b9](https://github.com/NelakaWith/faq-chatbot/commit/233f7b995a72923102af2d4b78a2f9600212b025))
* **CI:** enhance CI/CD setup with validation script and package updates ([1495c89](https://github.com/NelakaWith/faq-chatbot/commit/1495c89151ac4cfe2c9176483b52d07b3d191770))
* **ci:** implement multi-branch workflow strategy with develop and main branch support ([0a757b2](https://github.com/NelakaWith/faq-chatbot/commit/0a757b271a2e305496e9ffeb6286cf82a1c0dd69))

# [1.2.0](https://github.com/NelakaWith/faq-chatbot/compare/v1.1.0...v1.2.0) (2025-11-02)


### Bug Fixes

* **app:** Update API endpoint and environment variable references in README ([b5d254e](https://github.com/NelakaWith/faq-chatbot/commit/b5d254ea44bb2a94624e4b285fc487707669339c))
* **package:** Update version and description for backend and frontend packages ([a922df4](https://github.com/NelakaWith/faq-chatbot/commit/a922df444b44827e7ecf91d104a345688096f014))
* **routes:** update OpenRouter chat completions endpoint path ([9d20684](https://github.com/NelakaWith/faq-chatbot/commit/9d20684ea00570d176db91ffbc2e905185a8b1e9))


### Features

* **app:** Add LLMExample component for interactive LLM chat interface ([d1b565c](https://github.com/NelakaWith/faq-chatbot/commit/d1b565cc2464fe2b6faaa232754fce16589d81d2))
* **app:** add OpenRouter chat completions endpoint and environment configuration ([b395d34](https://github.com/NelakaWith/faq-chatbot/commit/b395d34f9d5983a66227f125ce9a8b16e7ea7c1e))
* **ChatWidget:** Add bot welcome message initialization and refactor message handling ([e429478](https://github.com/NelakaWith/faq-chatbot/commit/e42947846e105a303585e3ae6c261b3837dc0fc3))
* **ChatWidget:** integrate axios for chat API requests and improve error handling ([27e8bf6](https://github.com/NelakaWith/faq-chatbot/commit/27e8bf612108475febc8eac516c06ac66d7bf1ac))
* **ChatWidget:** Refactor chat widget components and add typing indicator ([9dc5460](https://github.com/NelakaWith/faq-chatbot/commit/9dc5460c0af28638adaee0d5203df7e8ce760837))

# [1.1.0](https://github.com/NelakaWith/faq-chatbot/compare/v1.0.0...v1.1.0) (2025-09-21)


### Bug Fixes

* **app:** fixed pr check and commit msgs ([72b39d5](https://github.com/NelakaWith/faq-chatbot/commit/72b39d5ee5d7039009fd34736b11f24e823fe775))
* correct pm2 process name for backend deployment ([9f31e3f](https://github.com/NelakaWith/faq-chatbot/commit/9f31e3fdb32de0fc87ddd49c2147288e010bdad1))


### Features

* enhance deployment workflow with GitHub deployment creation and status updates ([547dc69](https://github.com/NelakaWith/faq-chatbot/commit/547dc694221231c2d708a72597f872470cc2f06f))

# 1.0.0 (2025-09-21)


### Features

* add chat refinement and version management ([45a7ecb](https://github.com/NelakaWith/faq-chatbot/commit/45a7ecbeffbe4bf4029f3904a1ef8bc1f90fdb48))
* initialize monorepo with package.json and workspace setup ([adfd48e](https://github.com/NelakaWith/faq-chatbot/commit/adfd48e1ee0ab1ec267288ae9ee31f8ce334463a))
