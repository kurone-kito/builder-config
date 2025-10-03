[**@kurone-kito/vite-lib-config**](../README.md)

***

[@kurone-kito/vite-lib-config](../globals.md) / ViteConfigOptions

# Interface: ViteConfigOptions

Type definition for options used when creating a Vite configuration.

## See

[viteConfig](../functions/viteConfig.md)

## Properties

### cwd?

> `readonly` `optional` **cwd**: `string`

Base directory of the target project.

#### Default

```ts
process.cwd()
```

***

### entries?

> `readonly` `optional` **entries**: `Readonly`\<`Arrayable`\<`string`\>\>

Entry files relative to [srcDir](#srcdir).

#### Default

```ts
['index.mts']
```

***

### srcDir?

> `readonly` `optional` **srcDir**: `string`

Directory where the source files are located.

#### Default

```ts
'src'
```
