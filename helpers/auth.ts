import {
  IRequestValidateCustomerProductAuth,
  IResponseValidateCustomerProductAuth,
} from "@officexapp/types";

export const checkAuthValid = async (token: string) => {
  // fetch to POST `process.env.AUTH_CHECK_ORIGIN`/v1/{product_id}/validate-auth body { token }
  // returns {  }
};
