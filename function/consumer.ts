export const handler = async function (event: any) {
  let body = null;
  console.log("Event: ");
  console.log(event);
  event.Records.forEach((record: any) => {
    body = record;
  });
  console.log("Body: ");
  console.log(body);
  const response = {
    statusCode: 200,
    body: JSON.stringify(body),
  };
  return response;
};
