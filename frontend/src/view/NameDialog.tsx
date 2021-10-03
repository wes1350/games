import React, { useContext } from "react";
import "./NameDialog.css";
import { observer, useLocalObservable } from "mobx-react-lite";
import { action } from "mobx";
import { PlayerDataContext } from "context/PlayerDataContext";
import { BackendGateway } from "io/BackendGateway";

interface IProps {
    onSubmit: () => void;
}

export const NameDialog = observer((props: IProps) => {
    const inputRef = React.useRef<HTMLInputElement>();

    const localStore = useLocalObservable(() => ({
        nameValue: ""
    }));

    const nameContext = useContext(PlayerDataContext);

    const onSubmitName = (e: any) => {
        if (localStore.nameValue) {
            BackendGateway.SetName(localStore.nameValue).then(
                action(() => {
                    nameContext.setName(localStore.nameValue);
                })
            );
        }
        props.onSubmit();
    };

    return (
        <div className="username-dialog">
            <div className="username-dialog-name">Please enter your name:</div>
            <div className="username-dialog-input-container">
                <input
                    ref={inputRef}
                    type="text"
                    value={localStore.nameValue}
                    onChange={action((e: React.FormEvent<HTMLInputElement>) => {
                        localStore.nameValue = e.currentTarget.value;
                    })}
                />
            </div>
            <div className="username-dialog-button-container">
                <button
                    type="button"
                    onClick={() => {
                        onSubmitName(localStore.nameValue);
                    }}
                >
                    Save
                </button>
            </div>
        </div>
    );
});
