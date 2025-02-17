export default function AppContainer(props) {
    return (
        <div className={containerStyle}>
            {props.children}
        </div>
    );
}

