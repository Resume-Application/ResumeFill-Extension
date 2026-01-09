interface AutoFillData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin: string;
}

declare module "*.json" {
  const value: any;
  export default value;
}