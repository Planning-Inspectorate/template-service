export interface ItemListViewModel {
	pageHeading: string;
	items: TaskViewModel[];
}

export interface TaskViewModel {
	task: string;
	done: boolean;
}
