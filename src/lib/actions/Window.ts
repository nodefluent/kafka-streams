import { async as createSubject, AsyncSubject } from "most-subject";

/**
 * used to build windows of key value states
 * in a stream
 */
export class Window {
	public container: unknown[];
	public container$: AsyncSubject<unknown>;
	public collect: boolean;

	constructor(container: unknown[], collect = false) {
	  this.container = container || [];
	  this.container$ = createSubject();
	  this.collect = collect;
	}

	getStream(): AsyncSubject<unknown> {
	  return this.container$;
	}

	execute(element, leaveEncapsulated = true): void {
	  const ele = leaveEncapsulated ? element : element.value;
	  if (this.collect) {
	    this.container.push(ele);
	  } else {
	    this.container$.next(ele);
	  }
	}

	writeToStream(): void {
	  if (this.collect) {
	    this.container.forEach(event => this.container$.next(event));
	  } else {
	    // already written to stream
	  }
	}

	flush(): void {
	  this.container$.complete();
	}
}
