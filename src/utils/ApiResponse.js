

class ApiResponse {
  constructor(statusCode,  results, message = "success") {
    this.statusCode = statusCode;
    this.data = {
      seller: {
        pageInfo: {
          endCursor: null,
          hasNextPage: false,
          totalRecords:Array.isArray(results) ? results.length : 0
        },
        results: Array.isArray(results)
          ? results.map((item) => ({ node: item }))
          : results
      }
    };
    this.message = message;
    this.success = statusCode < 400;
  }
}



export { ApiResponse };
