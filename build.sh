echo "Getting Ready..."
rm -rf ./publish
mkdir -p ./publish/public
echo "Fetching Dependencies..."
yarn
echo "Building..."
yarn build
echo "Cleaning up..."
mkdir -p ./publish/assets
cp -r ./server/assets/* ./publish/assets
rm -rf ./server/tsc_out
cp -r ./client/dist/* ./publish/public
rm -rf ./client/dist