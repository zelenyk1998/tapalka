const ClickButton = ({ onClick }) => (
  <div id="clickButton" onClick={onClick}>
    <img id="fit-picture" src={require('../images/logo.png')} alt="Logo" style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        objectFit: 'cover'
      }}/>
  </div>
);

export default ClickButton;