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
