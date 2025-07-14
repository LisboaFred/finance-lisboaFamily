// types/express-validator.d.ts
declare module 'express-validator' {
  // aqui apenas declaramos o que usamos:
  export function body(field: string): any;
  export function validationResult(req: any): any;
}