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
  const getActivity = (id) =>
    lf.getItem(`${id}`).catch((error) => {
      console.log("CTD: I was fetching an activity and this happened ", error);
    });
  const setActivity = (data) =>
    lf.setItem(`${data.id}`, data).catch((error) => {
      console.log("CTD: I was saving an activity and this happened ", error);
    });
  const pushEmptyHistory = (activity) =>
    lf.setItem(`${activity.id}-${activity.historySize}`, {}).catch((error) => {
      console.log(
        "CTD: I was creating a history key and this happened ",
        error
      );
    });
  const writeHistory = (startEndKey, value) =>
    lf.setItem(`${activity.id}-${activity.historySize}`, {}).catch((error) => {
      console.log(
        "CTD: I was saving a history value and this happened ",
        error
      );
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
    createActivity: async ({ name, group }) => {
      const id = (await getLatestId()) + 1;
      const ids = await getIds();
      const historySize = 0;
      const activity = { id, name, group, historySize };
      const saveActivity = setActivity(activity);
      const createNewHistory = pushEmptyHistory(activity);
      const updateLatestId = setLatestId(id);
      const idString = `${id}`;
      ids[idString] = idString;
      const pushNewIndex = setIds(ids);
      return Promise.all([
        saveActivity,
        createNewHistory,
        updateLatestId,
        pushNewIndex,
      ]).then((s) => s[0]);
    },
    indexActivity: async () => {},
    updateActivity: async (id, update) => {},
    deleteActivity: async (id) => {},
  };
}
