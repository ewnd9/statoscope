import '@discoveryjs/discovery/dist/discovery.css';
import '../global.css';
import * as discoveryLib from '@discoveryjs/discovery';
import settings from '../settings';
import initMenu from './init-menu';

export default ({ element = document.body, data, name, prepare, views, pages }) => {
  const discovery = new discoveryLib.App(element, {
    darkmode: 'disabled',
    setup: {},
  });

  if (data) {
    data = Array.isArray(data) ? data : [data];
  }

  const context = {
    name,
    get stats() {
      return discovery.data;
    },
    get rawData() {
      return data;
    },
  };

  discovery.apply(discoveryLib.router);
  discovery.setPrepare(prepare(discovery));

  const setDataPromise = discovery.setData(data, context);

  discovery.apply(views);
  discovery.apply(pages);

  settings.eventChanged.on(() => discovery.renderPage());

  initMenu(discovery);

  setDataPromise.then(() => {
    const context = discovery.getRenderContext();

    if (!context.params.hash) {
      const targetHash = discovery.data[0]?.compilations[0]?.hash;
      const link = discovery.encodePageHash(context.page, context.id, {
        ...context.params,
        hash: targetHash,
      });
      location.assign(link);
    }
  });

  return discovery;
};
