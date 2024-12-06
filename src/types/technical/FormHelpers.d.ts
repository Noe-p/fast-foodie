type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : // eslint-disable-next-line @typescript-eslint/ban-types
    T[P] extends object | undefined
    ? RecursivePartial<T[P]>
    : T[P];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ErrorFormValues<FormValue> = { [P in keyof FormValue]?: string };

type FailureProps<Props> = Props & {
  error: string;
};
