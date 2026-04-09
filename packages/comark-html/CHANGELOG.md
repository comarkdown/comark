# Changelog

## [0.2.1](https://github.com/nuxt-content/mdc-syntax/compare/@comark/html@0.2.0...@comark/html@0.2.1) (2026-04-09)

### Features

* add Svelte example to docs ([#92](https://github.com/nuxt-content/mdc-syntax/issues/92)) ([d483aff](https://github.com/nuxt-content/mdc-syntax/commit/d483affee40729ad312242bf3d059a0752d9ccc2))
* improve Comark compatibility with Markdown Directives ([#99](https://github.com/nuxt-content/mdc-syntax/issues/99)) ([e4ed303](https://github.com/nuxt-content/mdc-syntax/commit/e4ed3035fcf89c99f35821c834cef0ef242bca2d))
* introduce json-render plugin ([#96](https://github.com/nuxt-content/mdc-syntax/issues/96)) ([753253f](https://github.com/nuxt-content/mdc-syntax/commit/753253f9ade46172915b25f15403f77ae8ada68f))
* **json-render:** support YAML via `yaml-render` code block ([#98](https://github.com/nuxt-content/mdc-syntax/issues/98)) ([91ac137](https://github.com/nuxt-content/mdc-syntax/commit/91ac1378cf04d9c249b6058506f57c085708769b))

### Bug Fixes

* **docs:** update formattedOutput to use reactive ref ([#95](https://github.com/nuxt-content/mdc-syntax/issues/95)) ([a1ef432](https://github.com/nuxt-content/mdc-syntax/commit/a1ef432e57f7285a49c858e5df38d092ec6ee4e1))

## [0.2.0](https://github.com/nuxt-content/mdc-syntax/compare/@comark/html@0.1.1...@comark/html@0.2.0) (2026-04-01)

### Features

* default class config for defined components ([#89](https://github.com/nuxt-content/mdc-syntax/issues/89)) ([bb8b7b7](https://github.com/nuxt-content/mdc-syntax/commit/bb8b7b76395f390f6a4a3fee6dc7ad9af5d58d00))

### Bug Fixes

* finalize highlight behavior ([#88](https://github.com/nuxt-content/mdc-syntax/issues/88)) ([2e070a9](https://github.com/nuxt-content/mdc-syntax/commit/2e070a95991e7b7f00e5de65a6795b52f868605c))
* **headings:** do not remove extracted node ([f31b23b](https://github.com/nuxt-content/mdc-syntax/commit/f31b23b40c5c10ff9f19e7336cc507fad1075cdd))
* **nuxt:** re-export Math & Mermaid plugins from Vue package ([caee05e](https://github.com/nuxt-content/mdc-syntax/commit/caee05ee50e0af5e1412186e80f449f650750bc2))
* **parse:** add suffix for duplicate heading ids in a document ([#85](https://github.com/nuxt-content/mdc-syntax/issues/85)) ([6c9bfcd](https://github.com/nuxt-content/mdc-syntax/commit/6c9bfcd1be0ff9538bd22cf4c36bace36cc345b3))
* **parse:** do not remove empty nodes (table cells) from tree ([#87](https://github.com/nuxt-content/mdc-syntax/issues/87)) ([6cafdc4](https://github.com/nuxt-content/mdc-syntax/commit/6cafdc4363b9d490c5f559cb30bdf7d8d24793ca))
* **parser:** position detection and content split ([3a0e7be](https://github.com/nuxt-content/mdc-syntax/commit/3a0e7bedcf4ea6c74b30bb7c85c3238a1b8981dd))
* **plugins:** add missing file extensions ([d72c7dc](https://github.com/nuxt-content/mdc-syntax/commit/d72c7dcffc8a88e7be3087e77f8b78325ad8f2c2))
* **vue:** duplicate `comark-content` class ([bede0fd](https://github.com/nuxt-content/mdc-syntax/commit/bede0fd85a256f80c31b56b9b40e358890572c1b))

## [0.1.1](https://github.com/nuxt-content/mdc-syntax/compare/@comark/html@0.1.0...@comark/html@0.1.1) (2026-03-25)

### Features

* use Shiki Hast highlighter to use transformers ([#73](https://github.com/nuxt-content/mdc-syntax/issues/73)) ([237a9e2](https://github.com/nuxt-content/mdc-syntax/commit/237a9e2b20911b73e94effd5340d793aafaa011a))

### Bug Fixes

* **ansi:** broken imports ([e631ae6](https://github.com/nuxt-content/mdc-syntax/commit/e631ae60d4893078acef7d0a218e6480f31fcee4))
* **config:** remove minimark from trace include and aline unhead version ([#71](https://github.com/nuxt-content/mdc-syntax/issues/71)) ([ccf6051](https://github.com/nuxt-content/mdc-syntax/commit/ccf60510115ceffce858a7b08d703f5cc9ba7e9b))
* **security:** options are optional ([de1ad4e](https://github.com/nuxt-content/mdc-syntax/commit/de1ad4e6c3b76ca77cd54a23ea9dd9685d3eec50))

## 0.1.0 (2026-03-23)

### Features

*  improve GFM syntax and React support ([30c0ae8](https://github.com/nuxt-content/mdc-syntax/commit/30c0ae81d6bf06cc49a847abcbcaba744dce9363))
* **`@comark/ansi`:** Comark tree to ANSI ([#58](https://github.com/nuxt-content/mdc-syntax/issues/58)) ([f0d4598](https://github.com/nuxt-content/mdc-syntax/commit/f0d459831ec3cd9adcfa2dd7004cae7a77849c12))
* **`@comark/html`:** Comark to HTML ([#60](https://github.com/nuxt-content/mdc-syntax/issues/60)) ([20c9074](https://github.com/nuxt-content/mdc-syntax/commit/20c9074b6ddf2b5992fa414cc996154e6b817d22))
* **`@comark/mermaid`:** introduce mermaid plugin ([b7fb476](https://github.com/nuxt-content/mdc-syntax/commit/b7fb476a51e39aa76544cf806e3d1574066e8cd6))
* `@mdc-syntax/math` package ([3c7538e](https://github.com/nuxt-content/mdc-syntax/commit/3c7538e3bf0b7786103d19929f46e909d67ca1dd))
* `defineComarkComponent` & shiki as peer dependency ([f846227](https://github.com/nuxt-content/mdc-syntax/commit/f846227754162d603db66dca1de5287544969da9))
* `plugins` props in `<Comark>` component ([bc4f4cf](https://github.com/nuxt-content/mdc-syntax/commit/bc4f4cfae52bd13bec6036388e68f47d7f7318a0))
* **alert:** add support for Github Alerts syntax ([#29](https://github.com/nuxt-content/mdc-syntax/issues/29)) ([6627e92](https://github.com/nuxt-content/mdc-syntax/commit/6627e9273981c7def328170c59782d41dc1d96ed))
* allow defining async component in string renderers ([#68](https://github.com/nuxt-content/mdc-syntax/issues/68)) ([59686f2](https://github.com/nuxt-content/mdc-syntax/commit/59686f22bdd030f959411e3991b7a8eb3ca55b73))
* auto close table syntax ([2bbb677](https://github.com/nuxt-content/mdc-syntax/commit/2bbb677f8b92b27efe2454f78f1a67ee24f7eba2))
* auto unwrap single child paragraphs ([69c5e0c](https://github.com/nuxt-content/mdc-syntax/commit/69c5e0c289a1c575fc67b3df6d7a5e6c0c024130))
* codeblock meta data ([c1a2a57](https://github.com/nuxt-content/mdc-syntax/commit/c1a2a57754cfde4ccd6da60279774ded5fab291b))
* comments ([12c694e](https://github.com/nuxt-content/mdc-syntax/commit/12c694ed0766b7cec5f768ba303e11f8a58d6f99))
* **docs:** seo improvements ([#43](https://github.com/nuxt-content/mdc-syntax/issues/43)) ([8d2d21a](https://github.com/nuxt-content/mdc-syntax/commit/8d2d21a1cd274036db71bf5007ae64b98cae1b1d))
* **docs:** update OG images ([#40](https://github.com/nuxt-content/mdc-syntax/issues/40)) ([3c4fc23](https://github.com/nuxt-content/mdc-syntax/commit/3c4fc23d9da0fdaf05ee0f16b9803002fc7b4062))
* **emoji:** add support for emojis with `:emoji_name:` syntax ([#3](https://github.com/nuxt-content/mdc-syntax/issues/3)) ([ccce54e](https://github.com/nuxt-content/mdc-syntax/commit/ccce54e0c4e17a3a38228d985e4989eccc8132c5))
* extend pre-defined Comark component ([aaaff86](https://github.com/nuxt-content/mdc-syntax/commit/aaaff86d2575753af271f376d8a5e146e42da7ca))
* get markdown content from default slot ([#7](https://github.com/nuxt-content/mdc-syntax/issues/7)) ([5827afe](https://github.com/nuxt-content/mdc-syntax/commit/5827afe2e9e50e8c7ff9a64fd7800ca548f14936))
* headings id and mixed inline components ([20c1a00](https://github.com/nuxt-content/mdc-syntax/commit/20c1a003f2faf86eee270e759e179706cede57fd))
* headings plugin ([f109555](https://github.com/nuxt-content/mdc-syntax/commit/f109555ea30e37788bccef4576fffcd6445c6f47))
* **html:** parse html to Comark Nodes ([#41](https://github.com/nuxt-content/mdc-syntax/issues/41)) ([cba3e38](https://github.com/nuxt-content/mdc-syntax/commit/cba3e38c35c1c886179a4dbb334f3e6e7f0a6c7d))
* line-break ([1599057](https://github.com/nuxt-content/mdc-syntax/commit/1599057d0288edfbacd6599543813a6a97418c6c))
* move highlight plugin out of parse options ([#14](https://github.com/nuxt-content/mdc-syntax/issues/14)) ([4827549](https://github.com/nuxt-content/mdc-syntax/commit/48275490096a26b9e2346cf4933dc0fbeeff4d7b))
* **nuxt:** add support for `<slot unwrap="">` ([49195f9](https://github.com/nuxt-content/mdc-syntax/commit/49195f9f7c89c3ba45a2461d8c78951bfb687adc))
* **nuxt:** introduce `comark/nuxt` ([#1](https://github.com/nuxt-content/mdc-syntax/issues/1)) ([22cae71](https://github.com/nuxt-content/mdc-syntax/commit/22cae718c3f8df72530a254ce35e4dd417e32ab6))
* **parser:** reused last tree to optimize next parse while streaming ([#32](https://github.com/nuxt-content/mdc-syntax/issues/32)) ([8a24aec](https://github.com/nuxt-content/mdc-syntax/commit/8a24aecfd30fe4dd5c59f19891c66657eb34acd9))
* **props:** standardize boolean ([#55](https://github.com/nuxt-content/mdc-syntax/issues/55)) ([be7964e](https://github.com/nuxt-content/mdc-syntax/commit/be7964eac8faf4e5dc8f95e101fe5a53c0ec5a35))
* react `defineComarkComponent` ([c72799f](https://github.com/nuxt-content/mdc-syntax/commit/c72799f869fec6d1687b9f1547283a178ca6acfd))
* security plugin ([50fee0f](https://github.com/nuxt-content/mdc-syntax/commit/50fee0f28a122e9061fa3cd2459f263bbcfe7902))
* **security:** control links and images ([#27](https://github.com/nuxt-content/mdc-syntax/issues/27)) ([00b3370](https://github.com/nuxt-content/mdc-syntax/commit/00b33705ddc40f0cbdec07cbeeb3077396cb2c26))
* shiki code highlighting ([9b6df0c](https://github.com/nuxt-content/mdc-syntax/commit/9b6df0cd0a257b3131e80c616616a167fa74b18c))
* **spec:** props syntax option ([#50](https://github.com/nuxt-content/mdc-syntax/issues/50)) ([48582cf](https://github.com/nuxt-content/mdc-syntax/commit/48582cf8ede27e4325e9cda5c03f9a7a70fa71b2))
* streaming caret indicator ([8228120](https://github.com/nuxt-content/mdc-syntax/commit/82281202be096fe3ec2e44bb2c74fb79122d5f19))
* **stringify:** inline/block detection and [#default](https://github.com/nuxt-content/mdc-syntax/issues/default) slot emission ([#42](https://github.com/nuxt-content/mdc-syntax/issues/42)) ([5ea621b](https://github.com/nuxt-content/mdc-syntax/commit/5ea621b77749782c6d2287cf1f0bd66a372e5eb3))
* Svelte renderer ([#30](https://github.com/nuxt-content/mdc-syntax/issues/30)) ([dd4a8aa](https://github.com/nuxt-content/mdc-syntax/commit/dd4a8aa580eca52ecea5d80ea234ef935f4c6419))
* use `@shikijs/primitive` ([#21](https://github.com/nuxt-content/mdc-syntax/issues/21)) ([f2c1c77](https://github.com/nuxt-content/mdc-syntax/commit/f2c1c7760c59e8a2b8fcf251401dae37d95d60c1))
* use `beautiful-mermaid` ([#18](https://github.com/nuxt-content/mdc-syntax/issues/18)) ([8c75077](https://github.com/nuxt-content/mdc-syntax/commit/8c75077f5994cd2e660644bd8d722a31cffeb565))
* use `yaml` package to parse frontmatter ([e592349](https://github.com/nuxt-content/mdc-syntax/commit/e592349f0e86e7a33f0c5f69408e6d5cb51aa6a3))
* vite integration `@comark/vue/vite` ([#65](https://github.com/nuxt-content/mdc-syntax/issues/65)) ([84716ea](https://github.com/nuxt-content/mdc-syntax/commit/84716eafb7c07d56f75bbfb1a2188ec51524d08b))

### Bug Fixes

* @comark/react build ([23ce515](https://github.com/nuxt-content/mdc-syntax/commit/23ce515631eba8072cf0b9ad6874c9132139ec2e))
* @comark/react build ([e296af8](https://github.com/nuxt-content/mdc-syntax/commit/e296af8e3962990dea7c8b21a51499e668a5680d))
* auto-close markdown ([0f76bac](https://github.com/nuxt-content/mdc-syntax/commit/0f76bac15652fa95c57ce1465297cc4a7c5627b1))
* **auto-close:** improve performance & partial issues ([2aadfc7](https://github.com/nuxt-content/mdc-syntax/commit/2aadfc75597498f68c845d6cf1441a03a78b72e0))
* **auto-close:** trailing spaces ([8664088](https://github.com/nuxt-content/mdc-syntax/commit/86640888114f9104f81d2575abb6ea6891140fd2))
* auto-unwrap issue with pargraphs, PascalCase components ([2b9defd](https://github.com/nuxt-content/mdc-syntax/commit/2b9defd2ee1245738df24aa444c06b950a60d11d))
* **caret:** caret size should match font size ([f167bc5](https://github.com/nuxt-content/mdc-syntax/commit/f167bc56bb63a1b49df552be6b8551a633023aff))
* **code-block:** do not add `\n` between lines ([e41d640](https://github.com/nuxt-content/mdc-syntax/commit/e41d6400fc20ac51721300fd6c8412b5cb3f38f5))
* comark vue package ([8f12e9f](https://github.com/nuxt-content/mdc-syntax/commit/8f12e9f9c653982cdf3c033e0808d9ab66db57c0))
* component resolve priority in renderer ([50315be](https://github.com/nuxt-content/mdc-syntax/commit/50315be08cc35630ca7a67e952e5e0c0f3c5edb1))
* corrects spelling errors ([#35](https://github.com/nuxt-content/mdc-syntax/issues/35)) ([ef21277](https://github.com/nuxt-content/mdc-syntax/commit/ef2127727f73f675b5ac1c2d53595701d6e730d4))
* detect code block language without space ([621d9ec](https://github.com/nuxt-content/mdc-syntax/commit/621d9ece0d740e0b550da7bb83ae843feef04abd))
* drop stream components in React ([3702c17](https://github.com/nuxt-content/mdc-syntax/commit/3702c177793ab5d65fd7bd21355a4b7e0f3fb6aa))
* expose `/vue/*` ([6455b2e](https://github.com/nuxt-content/mdc-syntax/commit/6455b2ec7830188aed2b9ce67767d745d5002b22))
* **highlight:** update default languages ([576bfaf](https://github.com/nuxt-content/mdc-syntax/commit/576bfaf8f239019f2c43e267b5a274e7c851a51b))
* improve slot unwrap support ([acdc297](https://github.com/nuxt-content/mdc-syntax/commit/acdc297247d0170d22dc6b928d3b4dc0cfe119fc))
* improve stringify and update playground ([edb3cf5](https://github.com/nuxt-content/mdc-syntax/commit/edb3cf572810084a1230de02dbcc3bb7a06e16f9))
* inline componet with content ([e8e2c9c](https://github.com/nuxt-content/mdc-syntax/commit/e8e2c9c293a63736054fe129afb0338bcd41fad8))
* lint and tests ([857e0e6](https://github.com/nuxt-content/mdc-syntax/commit/857e0e6c6f4b0304abb26574cb11a7ac7d4ae26c))
* **parse:** component with headings ([#56](https://github.com/nuxt-content/mdc-syntax/issues/56)) ([f21fc5d](https://github.com/nuxt-content/mdc-syntax/commit/f21fc5d18f23bedec8818bed6e29a2fa85bfd36e))
* **parse:** ensure task-list and alert are enabled by default ([#36](https://github.com/nuxt-content/mdc-syntax/issues/36)) ([7e71d52](https://github.com/nuxt-content/mdc-syntax/commit/7e71d526b209feed50c5fd1e79b1f9a61f0a1ca7))
* **parse:** multiple classes ([#53](https://github.com/nuxt-content/mdc-syntax/issues/53)) ([909584b](https://github.com/nuxt-content/mdc-syntax/commit/909584bb5f3b317c8809c096b2f2e3c482f3d938))
* **playground:** remove default parse options ([#51](https://github.com/nuxt-content/mdc-syntax/issues/51)) ([64649c1](https://github.com/nuxt-content/mdc-syntax/commit/64649c1d945979c93fc9b650d824bce948270265))
* plugins chunks ([f358e8b](https://github.com/nuxt-content/mdc-syntax/commit/f358e8b5384c78f1683fb492351dcbe5448465d4))
* pre component styles ([31186b1](https://github.com/nuxt-content/mdc-syntax/commit/31186b1b461cf0474117e80bd970430ddc84d4cb))
* prepack script ([ba3c847](https://github.com/nuxt-content/mdc-syntax/commit/ba3c847c34877aa898f206d59b540bdea6d565ec))
* remove default prose components ([f888dea](https://github.com/nuxt-content/mdc-syntax/commit/f888dea4024400c46f92084b22ce340adc53711b))
* **shiki:** dual theme ([2176594](https://github.com/nuxt-content/mdc-syntax/commit/2176594417d72ca62a8f67689fdfa0cdb3d47bfd))
* **spec:** inline component with boolean props ([#59](https://github.com/nuxt-content/mdc-syntax/issues/59)) ([d704fd2](https://github.com/nuxt-content/mdc-syntax/commit/d704fd2ecd6e71159fad927b24ab6f6e07e94d34))
* **stream:** catch errors while streaming ([5b896d7](https://github.com/nuxt-content/mdc-syntax/commit/5b896d78bb443bcc6126518b26e107c7ce2c00cb))
* use extension for relative imports ([9bef707](https://github.com/nuxt-content/mdc-syntax/commit/9bef7070d30cc5b0deb7114b642bf031c823d83d))

### Performance

* optimize Vue Renderer ([5ee6927](https://github.com/nuxt-content/mdc-syntax/commit/5ee6927f2c2ba132f87770bfe25567ac6949e3ac))
* rewrite auto close login with ~4x performance improve ([#24](https://github.com/nuxt-content/mdc-syntax/issues/24)) ([9e56177](https://github.com/nuxt-content/mdc-syntax/commit/9e56177b1cee11b514a428dc28cd7594eaf7b846))
* use `markdown-exit` parser ([#12](https://github.com/nuxt-content/mdc-syntax/issues/12)) ([b29eed6](https://github.com/nuxt-content/mdc-syntax/commit/b29eed6b6ed786c5170dd1daccce37a8203e8d2b))
