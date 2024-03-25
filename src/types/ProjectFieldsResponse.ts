type ProjectFieldIteration = {
  id: string;
  startDate: string;
};

type ProjectFieldData = {
  id: string;
  name: string;
  dataType: string;
  options?: [
    {
      id: string;
      name: string;
    }
  ];
  configuration?: {
    iterations: [ProjectFieldIteration];
  };
};

type ProjectFieldsResponse = {
  node: {
    fields: {
      nodes: [ProjectFieldData];
    };
  };
};

export default ProjectFieldsResponse;
