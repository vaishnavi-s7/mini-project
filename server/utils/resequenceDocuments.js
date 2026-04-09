export const resequenceDocuments = async (Model, buildId, idField) => {
  const documents = await Model.find().sort({ sequence_number: 1, _id: 1 });

  let requiresResequence = false;

  for (let index = 0; index < documents.length; index += 1) {
    const expectedSequence = index + 1;
    const expectedId = buildId(expectedSequence);

    if (
      documents[index].sequence_number !== expectedSequence ||
      documents[index][idField] !== expectedId
    ) {
      requiresResequence = true;
      break;
    }
  }

  if (!requiresResequence) {
    return documents;
  }

  for (let index = 0; index < documents.length; index += 1) {
    await Model.updateOne(
      { _id: documents[index]._id },
      {
        $set: {
          [idField]: `TMP_${documents[index]._id}`,
          sequence_number: -(index + 1),
        },
      }
    );
  }

  for (let index = 0; index < documents.length; index += 1) {
    const nextSequence = index + 1;

    await Model.updateOne(
      { _id: documents[index]._id },
      {
        $set: {
          [idField]: buildId(nextSequence),
          sequence_number: nextSequence,
        },
      }
    );
  }

  return Model.find().sort({ sequence_number: 1, _id: 1 });
};
