import * as sass from 'sass';
import path from 'node:path';
import fs from 'node:fs/promises';
import { copyFile, copyFolder } from './copy.ts';

interface SassOptions {
	staticDir: string;
	srcDir: string;
	govUkRoot: string;
}

/**
 * Compile sass into a css file in the .static folder
 *
 * @see https://sass-lang.com/documentation/js-api/#md:usage
 */
async function compileSass({ staticDir, srcDir, govUkRoot }: SassOptions): Promise<void> {
	const styleFile = path.join(srcDir, 'app', 'sass/style.scss');
	const out = sass.compile(styleFile, {
		// ensure scss can find the govuk-frontend folders
		loadPaths: [govUkRoot],
		style: 'compressed',
		// don't show depreciate warnings for govuk
		// see https://frontend.design-system.service.gov.uk/importing-css-assets-and-javascript/#silence-deprecation-warnings-from-dependencies-in-dart-sass
		quietDeps: true
	});
	const outputPath = path.join(staticDir, 'style.css');
	// make sure the static directory exists
	await fs.mkdir(staticDir, { recursive: true });
	// write the css file
	await fs.writeFile(outputPath, out.css);
}

interface AssetOptions {
	staticDir: string;
	govUkRoot: string;
}

/**
 * Copy govuk assets into the .static folder
 *
 * @see https://frontend.design-system.service.gov.uk/importing-css-assets-and-javascript/#copy-the-font-and-image-files-into-your-application
 * @returns {Promise<void>}
 */
async function copyAssets({ staticDir, govUkRoot }: AssetOptions): Promise<void> {
	const images = path.join(govUkRoot, 'node_modules/govuk-frontend/dist/govuk/assets/images');
	const fonts = path.join(govUkRoot, 'node_modules/govuk-frontend/dist/govuk/assets/fonts');
	const js = path.join(govUkRoot, 'node_modules/govuk-frontend/dist/govuk/govuk-frontend.min.js');
	const manifest = path.join(govUkRoot, 'node_modules/govuk-frontend/dist/govuk/assets/manifest.json');
	const rebrand = path.join(govUkRoot, 'node_modules/govuk-frontend/dist/govuk/assets/rebrand');

	const staticImages = path.join(staticDir, 'assets', 'images');
	const staticFonts = path.join(staticDir, 'assets', 'fonts');
	const staticJs = path.join(staticDir, 'assets', 'js', 'govuk-frontend.min.js');
	const staticManifest = path.join(staticDir, 'assets', 'manifest.json');
	const staticRebrand = path.join(staticDir, 'assets', 'rebrand');

	// copy all images and fonts for govuk-frontend
	await copyFolder(images, staticImages);
	await copyFolder(fonts, staticFonts);
	await copyFile(js, staticJs);
	await copyFile(manifest, staticManifest);
	await copyFolder(rebrand, staticRebrand);
}

interface AutocompleteOptions {
	staticDir: string;
	root: string;
}

/**
 * Copy accessible-autocomplete assets into the .static folder
 */
async function copyAutocompleteAssets({ staticDir, root }: AutocompleteOptions): Promise<void> {
	const js = path.join(root, 'accessible-autocomplete.min.js');
	const css = path.join(root, 'accessible-autocomplete.min.css');

	const staticJs = path.join(staticDir, 'assets', 'js', 'accessible-autocomplete.min.js');
	const staticCss = path.join(staticDir, 'assets', 'css', 'accessible-autocomplete.min.css');

	await copyFile(js, staticJs);
	await copyFile(css, staticCss);
}

interface BuildOptions {
	staticDir: string;
	srcDir: string;
	govUkRoot: string;
	accessibleAutocompleteRoot?: string;
}

/**
 * Do all steps to run the
 */
export function runBuild({ staticDir, srcDir, govUkRoot, accessibleAutocompleteRoot }: BuildOptions): Promise<void[]> {
	const tasks = [compileSass({ staticDir, srcDir, govUkRoot }), copyAssets({ staticDir, govUkRoot })];
	if (accessibleAutocompleteRoot) {
		tasks.push(copyAutocompleteAssets({ staticDir, root: accessibleAutocompleteRoot }));
	}
	return Promise.all(tasks);
}
