module.exports = {
  devServer: {
    allowedHosts: 'all',
    host: 'localhost',
    port: 3000,
    client: {
      webSocketURL: 'ws://localhost:3000/ws',
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      // Sửa lỗi allowedHosts
      if (webpackConfig.devServer) {
        webpackConfig.devServer.allowedHosts = 'all';
      }
      return webpackConfig;
    },
  },
}; 
