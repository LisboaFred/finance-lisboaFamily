// para suprimir os erros de import de express-validator
declare module 'express-validator' {
  export function body(field: string): any;
  export function validationResult(req: any): { isEmpty(): boolean; array(): any[] };
}
