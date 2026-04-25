## MomWiki Includes

This is a separate TiddlyWiki workspace focused on the `source/include` tree.

It generates:

- one tiddler per include file
- one tiddler per significant exported include routine
- directory pages for includes and routines

The built single-file HTML is written to:

- `output/mombot-include-reference.html`

To rebuild:

```bash
python3 scripts/build_include_wiki.py
```

The generator reads the live `source/include` tree and cross-references caller files from the current source tree.
