import { assetItemConfig } from './assets-tree';
import { chunkItemConfig } from './chunks-tree';
import { moduleItemConfig } from './modules-tree';
import { packageItemConfig } from './packages-tree';

export default (hash) => {
  return {
    view: 'tree',
    expanded: false,
    limitLines: '= settingListItemsLimit()',
    itemConfig: entryItemConfig(void 0, hash),
  };
};

export function entryItemConfig(getter = '$', hash = '#.params.hash') {
  return {
    limit: '= settingListItemsLimit()',
    content: {
      view: 'entry-item',
      data: `{
        entrypoint: ${getter},
        hash: ${hash},
        match: #.filter
      }`,
    },
    children: `
    $entry:$;
    $topLevelChunks:$entry.data.chunks;
    $chunks:$topLevelChunks + $topLevelChunks..children;
    $chunksAllModules:$chunks..modules.[not shouldHideModule()];
    $chunksModules:$chunks.modules.[not shouldHideModule()];
    $chunksModulesPackages:$chunksAllModules.(resolvedResource.nodeModule()).[].(name.resolvePackage(${hash})).[];
    $chunksPackages:$chunksModulesPackages.({name: name, instances: instances.[modules.[$ in $chunksAllModules]]});
    [{
      title: "Chunks",
      data: $chunks.sort(initial desc, entry desc, size desc),
      visible: $chunks,
      type: 'chunks'
    },{
      title: "Modules",
      data: $chunksModules.sort(moduleSize() desc),
      visible: $chunksModules,
      type: 'modules'
    },{
      title: "Packages",
      data: $chunksPackages.sort(instances.size() desc, name asc),
      visible: $chunksPackages,
      type: 'packages'
    },{
      title: "Assets",
      chunks: $chunks,
      visible: $chunks,
      type: 'assets'
    }].[visible]`,
    itemConfig: {
      view: 'switch',
      content: [
        {
          when: 'type="chunks"',
          content: {
            view: 'tree-leaf',
            content: 'text:title',
            children: `
            $initialChunks:data.[initial];
            $asyncChunks:data.[not initial];
            [{
              title: "Initial",
              data: $initialChunks,
              visible: $initialChunks,
              type: 'initial'
            },
            {
              title: "Async",
              data: $asyncChunks,
              visible: $asyncChunks,
              type: 'async'
            }].[visible]`,
            itemConfig: {
              content: [
                'text:title',
                {
                  when: 'data',
                  view: 'badge',
                  className: 'hack-badge-margin-left',
                  data: `{text: data.size()}`,
                },
              ],
              children: `data`,
              limit: '= settingListItemsLimit()',
              get itemConfig() {
                return chunkItemConfig(void 0, hash);
              },
            },
          },
        },
        {
          when: 'type="modules"',
          content: {
            view: 'tree-leaf',
            content: [
              'text:title',
              {
                when: 'data',
                view: 'badge',
                className: 'hack-badge-margin-left',
                data: `{text: data.size()}`,
              },
            ],
            children: `data`,
            limit: '= settingListItemsLimit()',
            get itemConfig() {
              return moduleItemConfig(void 0, hash);
            },
          },
        },
        {
          when: 'type="packages"',
          content: {
            view: 'tree-leaf',
            content: [
              'text:title',
              {
                when: 'data',
                view: 'badge',
                className: 'hack-badge-margin-left',
                data: `{text: data.size()}`,
              },
            ],
            children: 'data',
            limit: '= settingListItemsLimit()',
            get itemConfig() {
              return packageItemConfig(hash);
            },
          },
        },
        {
          when: 'type="assets"',
          content: {
            view: 'tree-leaf',
            content: 'text:title',
            children: `
            $initialChunks:chunks.[initial];
            $asyncChunks:chunks.[not initial];
            $initialAssets:$initialChunks.files;
            $asyncAssets:$asyncChunks.files;
            [{
              title: "Initial",
              data: $initialAssets.sort(isOverSizeLimit asc, size desc),
              visible: $initialAssets,
              type: 'initial'
            },
            {
              title: "Async",
              data: $asyncAssets.sort(isOverSizeLimit asc, size desc),
              visible: $asyncAssets,
              type: 'async'
            }].[visible]`,
            itemConfig: {
              content: [
                'text:title',
                {
                  when: 'data',
                  view: 'badge',
                  className: 'hack-badge-margin-left',
                  data: `{text: data.size()}`,
                },
              ],
              children: `data`,
              limit: '= settingListItemsLimit()',
              get itemConfig() {
                return assetItemConfig(void 0, hash);
              },
            },
          },
        },
      ],
    },
  };
}
