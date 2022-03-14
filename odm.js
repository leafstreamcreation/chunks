function ODM() {
  const lf = localforage;
  const STATE_LAST_ID = "latestId";
  const STATE_IDS = "ids";

  const getLatestId = () =>
    lf.getItem(STATE_LAST_ID).catch((error) => {
      console.log(
        "CTD: I was fetching store latestId and this happened ",
        error
      );
    });
  const setLatestId = (newId) =>
    lf.setItem(STATE_LAST_ID, newId).catch((error) => {
      console.log(
        "CTD: I was setting store latestId and this happened ",
        error
      );
    });
  const getIds = () =>
    lf.getItem(STATE_IDS).catch((error) => {
      console.log("CTD: I was fetching store ids and this happened ", error);
    });
  const setIds = (newIds) =>
    lf.setItem(STATE_IDS, newIds).catch((error) => {
      console.log("CTD: I was setting store ids and this happened ", error);
    });

  return {
    init: async () => {
      const latestId = await getLatestId();
      if (latestId === null) {
        const initLatestId = setLatestId(0);
        const initIds = setIds({});
        return Promise.all([initLatestId, initIds]);
      } else return Promise.resolve(null);
    },
    createActivity: async ({ name, group }) => {},
    indexActivity: async () => {},
    updateActivity: async (id, update) => {},
    deleteActivity: async (id) => {},
  };
}

// getActivity: (id) =>
//     localforage.getItem(`${id}`).catch((error) => {
//       console.log("CTD: I was fetching an activity and this happened ", error);
//     }),
//   setActivity: (data) =>
//     localforage.setItem(`${data.id}`).catch((error) => {
//       console.log("CTD: I was saving an activity and this happened ", error);
//     }),
