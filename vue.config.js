const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    allowedHosts: [
      '.compute-1.amazonaws.com/', // Replace with your actual domain or IP
      '34.238.39.60', // Replace with your EC2 instance's public IP
    ],
  },
});
