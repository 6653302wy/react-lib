
/**
 *  设置项目资源路径根目录
 */
const _assets: __WebpackModuleApi.RequireContext = require.context(
  "../assets/images/"
);

/**
 *  根据资源名动态获取图片对象
 * @param name 
 */
export const getImg = (name: string): string => {
  const key = "./" + name;
  return _assets.keys().includes(key) ? _assets(key) : name;
};
