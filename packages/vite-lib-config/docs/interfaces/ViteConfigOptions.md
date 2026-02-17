[**@kurone-kito/vite-lib-config**](../README.md)

***

[@kurone-kito/vite-lib-config](../globals.md) / ViteConfigOptions

# Interface: ViteConfigOptions

Type definition for options used when creating a Vite configuration.

## See

[viteConfig](../functions/viteConfig.md)

## Properties

### cwd?

> `readonly` `optional` **cwd?**: `string`

Base directory of the target project.

#### Default

```ts
process.cwd()
```

***

### entries?

> `readonly` `optional` **entries?**: `Readonly`\<`Arrayable`\<`string`\>\>

Entry files relative to [srcDir](#srcdir).

#### Default

```ts
['index.mts']
```

***

### sea?

> `readonly` `optional` **sea?**: `boolean`

Enable that builds for SEA (Single Executable Application).

If enabled, the build will bundle all dependencies into a single file.

#### Default

```ts
false
```

***

### srcDir?

> `readonly` `optional` **srcDir?**: `string`

Directory where the source files are located.

#### Default

```ts
'src'
```

***

### target?

> `readonly` `optional` **target?**: `Arrayable`\<`string`\>

Target environments for the build, specified as an array of strings.
Each string can represent a specific environment or a version, such as
'node20.20' or 'es2023'. These targets will be used to determine the
appropriate JavaScript features and syntax to include in the output.

#### Default

```ts
['node20.20', 'es2023']
```
