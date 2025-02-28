import { testResult, TestResultOutput } from "utils/testResult";
import { AWSClient } from "helpers/general";
import { region } from "../../helpers/general";

export default {
  async toContainItemWithValues(
    tableName: string,
    values: { [key: string]: unknown }
  ): Promise<TestResultOutput> {
    const docClient = new AWSClient.DynamoDB.DocumentClient({
      region: region,
    });
    const keys: { pk: unknown; sk?: unknown } = { pk: values["PK"] };
    if (values["SK"] !== undefined) {
      keys.sk = values["SK"];
    }
    const queryParams = {
      Key: keys,
      TableName: tableName,
    };
    try {
      const result = await docClient.get(queryParams).promise();
      Object.entries(values).forEach(([key, val]) => {
        if (result.Item?.[key] !== val) {
          return testResult(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `Item was expected to have ${key} value of ${val}, but instead had ${key} value of ${result.Item?.[key]}`,
            false
          );
        }
      });

      return testResult("Item exists with expected values", true);
    } catch (e: any) {
      console.log(e);

      return testResult("Item with specified keys does not exist.", false);
    }
  },
};
