# Changelog

## [0.3.1](https://github.com/comarkdown/comark/compare/@comark/svelte@0.2.1...@comark/svelte@0.3.1) (2026-04-24)

### Features

* **comark:** add breaks plugin ([#149](https://github.com/comarkdown/comark/issues/149)) ([90dca0d](https://github.com/comarkdown/comark/commit/90dca0dbc7749c1a54e80c14749023a1c3796375))
* **comark:** add footnotes plugin with parsing and rendering support ([#104](https://github.com/comarkdown/comark/issues/104)) ([3d74274](https://github.com/comarkdown/comark/commit/3d74274722e35f87180071285d16c8b519e26b40))
* **comark:** add punctuation plugin ([#123](https://github.com/comarkdown/comark/issues/123)) ([9b76e11](https://github.com/comarkdown/comark/commit/9b76e11e801e77e8403f71fbf642dccd8867e362))
* data binding in components ([#143](https://github.com/comarkdown/comark/issues/143)) ([feedcd7](https://github.com/comarkdown/comark/commit/feedcd71b14ec0909c3d7117d7ba3debb4cdf8ff))
* **docs:** enhance Playground with plugin management and parse options ([#107](https://github.com/comarkdown/comark/issues/107)) ([1dcb21b](https://github.com/comarkdown/comark/commit/1dcb21b47db747e8607e620236d95d53b148db30))
* new/default block attributes syntax ([#125](https://github.com/comarkdown/comark/issues/125)) ([5222cf9](https://github.com/comarkdown/comark/commit/5222cf95a5eb2ef7e61f3b7343fccfc4ed4245aa))
* **punctuation:** enhance punctuation plugin with normalization and locale-aware quotes ([#144](https://github.com/comarkdown/comark/issues/144)) ([62d996f](https://github.com/comarkdown/comark/commit/62d996f53f167e8f9e077a6d9db599fd4834c44e))
* **render:** conditional handlers to match nodes based on attributes or children or ... ([#130](https://github.com/comarkdown/comark/issues/130)) ([25e45cc](https://github.com/comarkdown/comark/commit/25e45ccca6ba21b37ea09119010ff3e4288f8e77))
* **rendering:** expose `dump` options for frontmatter serialization ([#101](https://github.com/comarkdown/comark/issues/101)) ([d294b0d](https://github.com/comarkdown/comark/commit/d294b0d732e04e129a93af4b3dccba16594492de))
* **specs:** autolink support ([#112](https://github.com/comarkdown/comark/issues/112)) ([1f8442f](https://github.com/comarkdown/comark/commit/1f8442f2b08ce3d579813f224e02e6c343a02aca))
* use parent heading id as prefix for child headings ([#126](https://github.com/comarkdown/comark/issues/126)) ([e83d889](https://github.com/comarkdown/comark/commit/e83d88992638a6ca7522b4156e30a7d34f9776a9))

### Bug Fixes

* **auto-close:** ensure underscore syntax does not joined with a word ([#131](https://github.com/comarkdown/comark/issues/131)) ([dd3fc00](https://github.com/comarkdown/comark/commit/dd3fc004e7db8816548154711e7174377f513dfe))
* **auto-close:** ignore contents inside attributes fence ([9eefd87](https://github.com/comarkdown/comark/commit/9eefd87f33f6dacd592745bc634938a8cd8aac50))
* **auto-close:** skip full link content and url part ([7e378be](https://github.com/comarkdown/comark/commit/7e378be4020adbd1e803845b91c8de5b31578798))
* **auto-close:** support ignore char in math syntax `\$` ([b1641ce](https://github.com/comarkdown/comark/commit/b1641ce818ad12d9fe1ea8ce5bcdcca14d0c82af))
* **deps:** deduplicate vue runtime to single version ([#133](https://github.com/comarkdown/comark/issues/133)) ([669ea89](https://github.com/comarkdown/comark/commit/669ea895daa28f7860d0a1755af780cbd1ea2864))
* **examples:** add tailwindcss to dependencies ([#109](https://github.com/comarkdown/comark/issues/109)) ([d17259b](https://github.com/comarkdown/comark/commit/d17259b3f527c431ae137d8e2cac6d8aa0811971))
* force extension for relative imports ([#152](https://github.com/comarkdown/comark/issues/152)) ([515c4dd](https://github.com/comarkdown/comark/commit/515c4ddcdbbb77eb2dbfe4923eb502b3675ca954))
* **img:** default alt to empty string to prevent 'undefined' in output ([#148](https://github.com/comarkdown/comark/issues/148)) ([5ba5507](https://github.com/comarkdown/comark/commit/5ba5507914e6dcabbc0e8c602613a45a392304c6))
* **mermaid:** set default height to auto ([#119](https://github.com/comarkdown/comark/issues/119)) ([fb5b909](https://github.com/comarkdown/comark/commit/fb5b909c900b12f636fcbc6800217065c09856c7))
* **parser:** return previous output on parse error while streaming ([#132](https://github.com/comarkdown/comark/issues/132)) ([7cf2c17](https://github.com/comarkdown/comark/commit/7cf2c17bd7c35955f87516e80657c37d7f3ea288))
* **render:** correct list indentation and block content in list items ([#120](https://github.com/comarkdown/comark/issues/120)) ([aad5516](https://github.com/comarkdown/comark/commit/aad5516565dd7cdc6c7e782c48e0a13abe4d993a))
* **specs:** preserve indentation of nested components in named slots ([#106](https://github.com/comarkdown/comark/issues/106)) ([9ebddfd](https://github.com/comarkdown/comark/commit/9ebddfd4dd29ac9259f689b7150953f1e61b7001))
* **vue:** typo in slot unwrap prop name ([#127](https://github.com/comarkdown/comark/issues/127)) ([1517e95](https://github.com/comarkdown/comark/commit/1517e95bdcd5176fa36aec643d9ccef4b1a277f6))

## [0.2.1](https://github.com/comarkdown/comark/compare/@comark/svelte@0.2.0...@comark/svelte@0.2.1) (2026-04-09)

### Features

* add Svelte example to docs ([#92](https://github.com/comarkdown/comark/issues/92)) ([d483aff](https://github.com/comarkdown/comark/commit/d483affee40729ad312242bf3d059a0752d9ccc2))
* improve Comark compatibility with Markdown Directives ([#99](https://github.com/comarkdown/comark/issues/99)) ([e4ed303](https://github.com/comarkdown/comark/commit/e4ed3035fcf89c99f35821c834cef0ef242bca2d))
* introduce json-render plugin ([#96](https://github.com/comarkdown/comark/issues/96)) ([753253f](https://github.com/comarkdown/comark/commit/753253f9ade46172915b25f15403f77ae8ada68f))
* **json-render:** support YAML via `yaml-render` code block ([#98](https://github.com/comarkdown/comark/issues/98)) ([91ac137](https://github.com/comarkdown/comark/commit/91ac1378cf04d9c249b6058506f57c085708769b))

### Bug Fixes

* **docs:** update formattedOutput to use reactive ref ([#95](https://github.com/comarkdown/comark/issues/95)) ([a1ef432](https://github.com/comarkdown/comark/commit/a1ef432e57f7285a49c858e5df38d092ec6ee4e1))

## [0.2.0](https://github.com/comarkdown/comark/compare/@comark/svelte@0.1.2...@comark/svelte@0.2.0) (2026-04-01)

### Features

* default class config for defined components ([#89](https://github.com/comarkdown/comark/issues/89)) ([bb8b7b7](https://github.com/comarkdown/comark/commit/bb8b7b76395f390f6a4a3fee6dc7ad9af5d58d00))

### Bug Fixes

* finalize highlight behavior ([#88](https://github.com/comarkdown/comark/issues/88)) ([2e070a9](https://github.com/comarkdown/comark/commit/2e070a95991e7b7f00e5de65a6795b52f868605c))
* **headings:** do not remove extracted node ([f31b23b](https://github.com/comarkdown/comark/commit/f31b23b40c5c10ff9f19e7336cc507fad1075cdd))
* **nuxt:** re-export Math & Mermaid plugins from Vue package ([caee05e](https://github.com/comarkdown/comark/commit/caee05ee50e0af5e1412186e80f449f650750bc2))
* **parse:** add suffix for duplicate heading ids in a document ([#85](https://github.com/comarkdown/comark/issues/85)) ([6c9bfcd](https://github.com/comarkdown/comark/commit/6c9bfcd1be0ff9538bd22cf4c36bace36cc345b3))
* **parse:** do not remove empty nodes (table cells) from tree ([#87](https://github.com/comarkdown/comark/issues/87)) ([6cafdc4](https://github.com/comarkdown/comark/commit/6cafdc4363b9d490c5f559cb30bdf7d8d24793ca))
* **parser:** position detection and content split ([3a0e7be](https://github.com/comarkdown/comark/commit/3a0e7bedcf4ea6c74b30bb7c85c3238a1b8981dd))
* **plugins:** add missing file extensions ([d72c7dc](https://github.com/comarkdown/comark/commit/d72c7dcffc8a88e7be3087e77f8b78325ad8f2c2))
* **vue:** duplicate `comark-content` class ([bede0fd](https://github.com/comarkdown/comark/commit/bede0fd85a256f80c31b56b9b40e358890572c1b))

## [0.1.2](https://github.com/comarkdown/comark/compare/@comark/svelte@0.1.1...@comark/svelte@0.1.2) (2026-03-25)

### Features

* use Shiki Hast highlighter to use transformers ([#73](https://github.com/comarkdown/comark/issues/73)) ([237a9e2](https://github.com/comarkdown/comark/commit/237a9e2b20911b73e94effd5340d793aafaa011a))

### Bug Fixes

* **ansi:** broken imports ([e631ae6](https://github.com/comarkdown/comark/commit/e631ae60d4893078acef7d0a218e6480f31fcee4))
* **config:** remove minimark from trace include and aline unhead version ([#71](https://github.com/comarkdown/comark/issues/71)) ([ccf6051](https://github.com/comarkdown/comark/commit/ccf60510115ceffce858a7b08d703f5cc9ba7e9b))
* **security:** options are optional ([de1ad4e](https://github.com/comarkdown/comark/commit/de1ad4e6c3b76ca77cd54a23ea9dd9685d3eec50))

## [0.1.1](https://github.com/comarkdown/comark/compare/@comark/svelte@0.1.0...@comark/svelte@0.1.1) (2026-03-23)

## 0.1.0 (2026-03-23)

### Features

*  improve GFM syntax and React support ([30c0ae8](https://github.com/comarkdown/comark/commit/30c0ae81d6bf06cc49a847abcbcaba744dce9363))
* **`@comark/ansi`:** Comark tree to ANSI ([#58](https://github.com/comarkdown/comark/issues/58)) ([f0d4598](https://github.com/comarkdown/comark/commit/f0d459831ec3cd9adcfa2dd7004cae7a77849c12))
* **`@comark/html`:** Comark to HTML ([#60](https://github.com/comarkdown/comark/issues/60)) ([20c9074](https://github.com/comarkdown/comark/commit/20c9074b6ddf2b5992fa414cc996154e6b817d22))
* **`@comark/mermaid`:** introduce mermaid plugin ([b7fb476](https://github.com/comarkdown/comark/commit/b7fb476a51e39aa76544cf806e3d1574066e8cd6))
* `@mdc-syntax/math` package ([3c7538e](https://github.com/comarkdown/comark/commit/3c7538e3bf0b7786103d19929f46e909d67ca1dd))
* `defineComarkComponent` & shiki as peer dependency ([f846227](https://github.com/comarkdown/comark/commit/f846227754162d603db66dca1de5287544969da9))
* `plugins` props in `<Comark>` component ([bc4f4cf](https://github.com/comarkdown/comark/commit/bc4f4cfae52bd13bec6036388e68f47d7f7318a0))
* **alert:** add support for Github Alerts syntax ([#29](https://github.com/comarkdown/comark/issues/29)) ([6627e92](https://github.com/comarkdown/comark/commit/6627e9273981c7def328170c59782d41dc1d96ed))
* allow defining async component in string renderers ([#68](https://github.com/comarkdown/comark/issues/68)) ([59686f2](https://github.com/comarkdown/comark/commit/59686f22bdd030f959411e3991b7a8eb3ca55b73))
* auto close table syntax ([2bbb677](https://github.com/comarkdown/comark/commit/2bbb677f8b92b27efe2454f78f1a67ee24f7eba2))
* auto unwrap single child paragraphs ([69c5e0c](https://github.com/comarkdown/comark/commit/69c5e0c289a1c575fc67b3df6d7a5e6c0c024130))
* codeblock meta data ([c1a2a57](https://github.com/comarkdown/comark/commit/c1a2a57754cfde4ccd6da60279774ded5fab291b))
* comments ([12c694e](https://github.com/comarkdown/comark/commit/12c694ed0766b7cec5f768ba303e11f8a58d6f99))
* **docs:** seo improvements ([#43](https://github.com/comarkdown/comark/issues/43)) ([8d2d21a](https://github.com/comarkdown/comark/commit/8d2d21a1cd274036db71bf5007ae64b98cae1b1d))
* **docs:** update OG images ([#40](https://github.com/comarkdown/comark/issues/40)) ([3c4fc23](https://github.com/comarkdown/comark/commit/3c4fc23d9da0fdaf05ee0f16b9803002fc7b4062))
* **emoji:** add support for emojis with `:emoji_name:` syntax ([#3](https://github.com/comarkdown/comark/issues/3)) ([ccce54e](https://github.com/comarkdown/comark/commit/ccce54e0c4e17a3a38228d985e4989eccc8132c5))
* extend pre-defined Comark component ([aaaff86](https://github.com/comarkdown/comark/commit/aaaff86d2575753af271f376d8a5e146e42da7ca))
* get markdown content from default slot ([#7](https://github.com/comarkdown/comark/issues/7)) ([5827afe](https://github.com/comarkdown/comark/commit/5827afe2e9e50e8c7ff9a64fd7800ca548f14936))
* headings id and mixed inline components ([20c1a00](https://github.com/comarkdown/comark/commit/20c1a003f2faf86eee270e759e179706cede57fd))
* headings plugin ([f109555](https://github.com/comarkdown/comark/commit/f109555ea30e37788bccef4576fffcd6445c6f47))
* **html:** parse html to Comark Nodes ([#41](https://github.com/comarkdown/comark/issues/41)) ([cba3e38](https://github.com/comarkdown/comark/commit/cba3e38c35c1c886179a4dbb334f3e6e7f0a6c7d))
* line-break ([1599057](https://github.com/comarkdown/comark/commit/1599057d0288edfbacd6599543813a6a97418c6c))
* move highlight plugin out of parse options ([#14](https://github.com/comarkdown/comark/issues/14)) ([4827549](https://github.com/comarkdown/comark/commit/48275490096a26b9e2346cf4933dc0fbeeff4d7b))
* **nuxt:** add support for `<slot unwrap="">` ([49195f9](https://github.com/comarkdown/comark/commit/49195f9f7c89c3ba45a2461d8c78951bfb687adc))
* **nuxt:** introduce `comark/nuxt` ([#1](https://github.com/comarkdown/comark/issues/1)) ([22cae71](https://github.com/comarkdown/comark/commit/22cae718c3f8df72530a254ce35e4dd417e32ab6))
* **parser:** reused last tree to optimize next parse while streaming ([#32](https://github.com/comarkdown/comark/issues/32)) ([8a24aec](https://github.com/comarkdown/comark/commit/8a24aecfd30fe4dd5c59f19891c66657eb34acd9))
* **props:** standardize boolean ([#55](https://github.com/comarkdown/comark/issues/55)) ([be7964e](https://github.com/comarkdown/comark/commit/be7964eac8faf4e5dc8f95e101fe5a53c0ec5a35))
* react `defineComarkComponent` ([c72799f](https://github.com/comarkdown/comark/commit/c72799f869fec6d1687b9f1547283a178ca6acfd))
* security plugin ([50fee0f](https://github.com/comarkdown/comark/commit/50fee0f28a122e9061fa3cd2459f263bbcfe7902))
* **security:** control links and images ([#27](https://github.com/comarkdown/comark/issues/27)) ([00b3370](https://github.com/comarkdown/comark/commit/00b33705ddc40f0cbdec07cbeeb3077396cb2c26))
* shiki code highlighting ([9b6df0c](https://github.com/comarkdown/comark/commit/9b6df0cd0a257b3131e80c616616a167fa74b18c))
* **spec:** props syntax option ([#50](https://github.com/comarkdown/comark/issues/50)) ([48582cf](https://github.com/comarkdown/comark/commit/48582cf8ede27e4325e9cda5c03f9a7a70fa71b2))
* streaming caret indicator ([8228120](https://github.com/comarkdown/comark/commit/82281202be096fe3ec2e44bb2c74fb79122d5f19))
* **stringify:** inline/block detection and [#default](https://github.com/comarkdown/comark/issues/default) slot emission ([#42](https://github.com/comarkdown/comark/issues/42)) ([5ea621b](https://github.com/comarkdown/comark/commit/5ea621b77749782c6d2287cf1f0bd66a372e5eb3))
* Svelte renderer ([#30](https://github.com/comarkdown/comark/issues/30)) ([dd4a8aa](https://github.com/comarkdown/comark/commit/dd4a8aa580eca52ecea5d80ea234ef935f4c6419))
* use `@shikijs/primitive` ([#21](https://github.com/comarkdown/comark/issues/21)) ([f2c1c77](https://github.com/comarkdown/comark/commit/f2c1c7760c59e8a2b8fcf251401dae37d95d60c1))
* use `beautiful-mermaid` ([#18](https://github.com/comarkdown/comark/issues/18)) ([8c75077](https://github.com/comarkdown/comark/commit/8c75077f5994cd2e660644bd8d722a31cffeb565))
* use `yaml` package to parse frontmatter ([e592349](https://github.com/comarkdown/comark/commit/e592349f0e86e7a33f0c5f69408e6d5cb51aa6a3))
* vite integration `@comark/vue/vite` ([#65](https://github.com/comarkdown/comark/issues/65)) ([84716ea](https://github.com/comarkdown/comark/commit/84716eafb7c07d56f75bbfb1a2188ec51524d08b))

### Bug Fixes

* @comark/react build ([23ce515](https://github.com/comarkdown/comark/commit/23ce515631eba8072cf0b9ad6874c9132139ec2e))
* @comark/react build ([e296af8](https://github.com/comarkdown/comark/commit/e296af8e3962990dea7c8b21a51499e668a5680d))
* auto-close markdown ([0f76bac](https://github.com/comarkdown/comark/commit/0f76bac15652fa95c57ce1465297cc4a7c5627b1))
* **auto-close:** improve performance & partial issues ([2aadfc7](https://github.com/comarkdown/comark/commit/2aadfc75597498f68c845d6cf1441a03a78b72e0))
* **auto-close:** trailing spaces ([8664088](https://github.com/comarkdown/comark/commit/86640888114f9104f81d2575abb6ea6891140fd2))
* auto-unwrap issue with pargraphs, PascalCase components ([2b9defd](https://github.com/comarkdown/comark/commit/2b9defd2ee1245738df24aa444c06b950a60d11d))
* **caret:** caret size should match font size ([f167bc5](https://github.com/comarkdown/comark/commit/f167bc56bb63a1b49df552be6b8551a633023aff))
* **code-block:** do not add `\n` between lines ([e41d640](https://github.com/comarkdown/comark/commit/e41d6400fc20ac51721300fd6c8412b5cb3f38f5))
* comark vue package ([8f12e9f](https://github.com/comarkdown/comark/commit/8f12e9f9c653982cdf3c033e0808d9ab66db57c0))
* component resolve priority in renderer ([50315be](https://github.com/comarkdown/comark/commit/50315be08cc35630ca7a67e952e5e0c0f3c5edb1))
* corrects spelling errors ([#35](https://github.com/comarkdown/comark/issues/35)) ([ef21277](https://github.com/comarkdown/comark/commit/ef2127727f73f675b5ac1c2d53595701d6e730d4))
* detect code block language without space ([621d9ec](https://github.com/comarkdown/comark/commit/621d9ece0d740e0b550da7bb83ae843feef04abd))
* drop stream components in React ([3702c17](https://github.com/comarkdown/comark/commit/3702c177793ab5d65fd7bd21355a4b7e0f3fb6aa))
* expose `/vue/*` ([6455b2e](https://github.com/comarkdown/comark/commit/6455b2ec7830188aed2b9ce67767d745d5002b22))
* **highlight:** update default languages ([576bfaf](https://github.com/comarkdown/comark/commit/576bfaf8f239019f2c43e267b5a274e7c851a51b))
* improve slot unwrap support ([acdc297](https://github.com/comarkdown/comark/commit/acdc297247d0170d22dc6b928d3b4dc0cfe119fc))
* improve stringify and update playground ([edb3cf5](https://github.com/comarkdown/comark/commit/edb3cf572810084a1230de02dbcc3bb7a06e16f9))
* inline componet with content ([e8e2c9c](https://github.com/comarkdown/comark/commit/e8e2c9c293a63736054fe129afb0338bcd41fad8))
* lint and tests ([857e0e6](https://github.com/comarkdown/comark/commit/857e0e6c6f4b0304abb26574cb11a7ac7d4ae26c))
* **parse:** component with headings ([#56](https://github.com/comarkdown/comark/issues/56)) ([f21fc5d](https://github.com/comarkdown/comark/commit/f21fc5d18f23bedec8818bed6e29a2fa85bfd36e))
* **parse:** ensure task-list and alert are enabled by default ([#36](https://github.com/comarkdown/comark/issues/36)) ([7e71d52](https://github.com/comarkdown/comark/commit/7e71d526b209feed50c5fd1e79b1f9a61f0a1ca7))
* **parse:** multiple classes ([#53](https://github.com/comarkdown/comark/issues/53)) ([909584b](https://github.com/comarkdown/comark/commit/909584bb5f3b317c8809c096b2f2e3c482f3d938))
* **playground:** remove default parse options ([#51](https://github.com/comarkdown/comark/issues/51)) ([64649c1](https://github.com/comarkdown/comark/commit/64649c1d945979c93fc9b650d824bce948270265))
* plugins chunks ([f358e8b](https://github.com/comarkdown/comark/commit/f358e8b5384c78f1683fb492351dcbe5448465d4))
* pre component styles ([31186b1](https://github.com/comarkdown/comark/commit/31186b1b461cf0474117e80bd970430ddc84d4cb))
* prepack script ([ba3c847](https://github.com/comarkdown/comark/commit/ba3c847c34877aa898f206d59b540bdea6d565ec))
* remove default prose components ([f888dea](https://github.com/comarkdown/comark/commit/f888dea4024400c46f92084b22ce340adc53711b))
* **shiki:** dual theme ([2176594](https://github.com/comarkdown/comark/commit/2176594417d72ca62a8f67689fdfa0cdb3d47bfd))
* **spec:** inline component with boolean props ([#59](https://github.com/comarkdown/comark/issues/59)) ([d704fd2](https://github.com/comarkdown/comark/commit/d704fd2ecd6e71159fad927b24ab6f6e07e94d34))
* **stream:** catch errors while streaming ([5b896d7](https://github.com/comarkdown/comark/commit/5b896d78bb443bcc6126518b26e107c7ce2c00cb))
* use extension for relative imports ([9bef707](https://github.com/comarkdown/comark/commit/9bef7070d30cc5b0deb7114b642bf031c823d83d))

### Performance

* optimize Vue Renderer ([5ee6927](https://github.com/comarkdown/comark/commit/5ee6927f2c2ba132f87770bfe25567ac6949e3ac))
* rewrite auto close login with ~4x performance improve ([#24](https://github.com/comarkdown/comark/issues/24)) ([9e56177](https://github.com/comarkdown/comark/commit/9e56177b1cee11b514a428dc28cd7594eaf7b846))
* use `markdown-exit` parser ([#12](https://github.com/comarkdown/comark/issues/12)) ([b29eed6](https://github.com/comarkdown/comark/commit/b29eed6b6ed786c5170dd1daccce37a8203e8d2b))
