#!/usr/bin/env node --enable-source-maps

import HelloWorld from '@kurone-kito/example-lib';
import { detectImportWithError } from '@kurone-kito/web-toybox-node';

detectImportWithError(import.meta.url);
console.log(HelloWorld);
