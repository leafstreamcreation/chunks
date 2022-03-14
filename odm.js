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
  const getLatestHistory = (activity) =>
    lf.getItem(`${activity.id}-${activity.historySize}`).catch((error) => {
      console.log(
        "CTD: I was fetching a history value and this happened ",
        error
      );
    });
  const setLatestHistory = (activity, value) =>
    lf
      .setItem(`${activity.id}-${activity.historySize}`, value)
      .catch((error) => {
        console.log(
          "CTD: I was saving a history value and this happened ",
          error
        );
      });
  const populateHistory = async (activity) => {
    const { id, name, group, historySize } = activity;
    const history = [];
    for (let i = 0; i < historySize + 1; i++) {
      const entryKey = `${id}-${i}`;
      history.push(
        lf.getItem(entryKey).catch((error) => {
          console.log(
            "CTD: I was fetching a history value and this happened ",
            error
          );
        })
      );
    }

    const values = await Promise.all(history);
    return Promise.resolve({ id, name, group, history: values });
  };
  const drop = (key) =>
    lf.removeItem(key).catch((error) => {
      console.log("CTD: I was deleting a value and this happened ", error);
    });

  return {
    dropDB: () => lf.clear(),
    init: async () => {
      const latestId = await getLatestId();
      if (latestId === null) {
        console.log("initializing");
        await lf.clear();
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
      ids[`${id}`] = id;
      const pushNewIndex = setIds(ids);
      return Promise.all([
        saveActivity,
        createNewHistory,
        updateLatestId,
        pushNewIndex,
      ]).then((s) => {
        const { id, name, group } = s[0];
        return { id, name, group, history: [{}] };
      });
    },
    indexActivity: async () => {
      const ids = await getIds();
      const fetchActivities = [];
      for (const key in ids) {
        fetchActivities.push(getActivity(key).then((a) => populateHistory(a)));
      }
      return Promise.all(fetchActivities);
    },
    updateActivity: async (id, update) => {
      const toUpdate = await getActivity(id);
      if (toUpdate === null) return Promise.resolve(null);
      if (update.name) {
        toUpdate.name = update.name;
        return setActivity(toUpdate);
      }
      const history = await getLatestHistory(toUpdate);
      if (history === null) return Promise.resolve(null);
      if (history.startDate) {
        if (!update.endDate) return Promise.reject("End date expected");
        toUpdate.historySize += 1;
        history.endDate = update.endDate;
        await setLatestHistory(toUpdate, history);
        await pushEmptyHistory(toUpdate);
        return setActivity(toUpdate).then((a) => populateHistory(a));
      }
      if (!update.startDate) return Promise.reject("Start date expected");
      history.startDate = update.startDate;
      await setLatestHistory(toUpdate, history);
      return populateHistory(toUpdate);
    },
    deleteActivity: async (id) => {
      const toDelete = await getActivity(id);
      if (toDelete === null) return Promise.resolve(null);
      const ids = await getIds();
      const idString = `${toDelete.id}`;

      const dropActivity = drop(idString);

      const dropHistory = [];
      for (let i = 0; i < toDelete.historySize + 1; i++) {
        const entryKey = `${idString}-${i}`;
        dropHistory.push(drop(entryKey));
      }

      delete ids[idString];
      const removeIndex = setIds(ids);

      return Promise.all([dropActivity, removeIndex, ...dropHistory]).then(
        () => toDelete
      );
    },
  };
}
