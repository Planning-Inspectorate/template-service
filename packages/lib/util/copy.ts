import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Copy a folder to a new location, and create that new directory if it doesn't exist
 */
export async function copyFolder(from: string, to: string): Promise<void> {
	// make the destination directory, and any parent directories
	await fs.mkdir(to, { recursive: true });
	// read the directory to be copied
	const ls = await fs.readdir(from);
	const tasks: Promise<void>[] = [];
	for (const item of ls) {
		// for each file, or folder, add a task to the list to copy that file or folder
		tasks.push(copyFileOrFolder(path.join(from, item), path.join(to, item)));
	}
	// wait for all tasks to complete
	await Promise.all(tasks);
}

/**
 * Copy a file or folder, recursively
 */
async function copyFileOrFolder(from: string, to: string): Promise<void> {
	// check if this is a file or folder
	const stat = await fs.lstat(from);
	if (stat.isFile()) {
		// if a file, just copy it
		await fs.copyFile(from, to);
	} else {
		// else, copy the whole folder
		await copyFolder(from, to);
	}
}

/**
 * Copy a file, ensuring the destination exists
 */
export async function copyFile(from: string, to: string): Promise<void> {
	const destDir = path.dirname(to);
	// make the destination directory, and any parent directories
	await fs.mkdir(destDir, { recursive: true });
	await fs.copyFile(from, to);
}
