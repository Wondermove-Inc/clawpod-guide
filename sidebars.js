const guide = require('./docs.json');
module.exports = {
  guideSidebar: guide.navigation.groups.map(({ group, pages }) => ({
    type: 'category', label: group, collapsed: true, items: pages,
  })),
};
