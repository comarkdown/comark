## Input

```md
|   序号 | 任务名称       | 任务内容                               | 执行智能体     | 任务状态   |
|-----:|:-----------|:-----------------------------------|:----------|:-------|
|      |            | 1. 首先查询'xx'相关的所列表，获取名称和 ID  |           |        |
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "table",
      {},
      [
        "thead",
        {},
        [
          "tr",
          {},
          [
            "th",
            {
              "style": "text-align:right"
            },
            "序号"
          ],
          [
            "th",
            {
              "style": "text-align:left"
            },
            "任务名称"
          ],
          [
            "th",
            {
              "style": "text-align:left"
            },
            "任务内容"
          ],
          [
            "th",
            {
              "style": "text-align:left"
            },
            "执行智能体"
          ],
          [
            "th",
            {
              "style": "text-align:left"
            },
            "任务状态"
          ]
        ]
      ],
      [
        "tbody",
        {},
        [
          "tr",
          {},
          [
            "td",
            {
              "style": "text-align:right"
            }
          ],
          [
            "td",
            {
              "style": "text-align:left"
            }
          ],
          [
            "td",
            {
              "style": "text-align:left"
            },
            "1. 首先查询'xx'相关的所列表，获取名称和 ID"
          ],
          [
            "td",
            {
              "style": "text-align:left"
            }
          ],
          [
            "td",
            {
              "style": "text-align:left"
            }
          ]
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<table>
  <thead>
    <tr>
      <th style="text-align:right">序号</th>
      <th style="text-align:left">任务名称</th>
      <th style="text-align:left">任务内容</th>
      <th style="text-align:left">执行智能体</th>
      <th style="text-align:left">任务状态</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:right"></td>
      <td style="text-align:left"></td>
      <td style="text-align:left">1. 首先查询'xx'相关的所列表，获取名称和 ID</td>
      <td style="text-align:left"></td>
      <td style="text-align:left"></td>
    </tr>
  </tbody>
</table>
```

## Markdown

```md
| 序号  | 任务名称 | 任务内容                       | 执行智能体 | 任务状态 |
| --: | :--- | :------------------------- | :---- | :--- |
|     |      | 1. 首先查询'xx'相关的所列表，获取名称和 ID |       |      |
```
