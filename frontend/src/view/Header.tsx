import React, { useContext } from "react";
import "./Header.css";
import { NavLink } from "react-router-dom";
import { observer, useLocalObservable } from "mobx-react-lite";
import { action } from "mobx";
import { PlayerDataContext } from "context/PlayerDataContext";
import { NameDialog } from "./NameDialog";

export const Header = observer(() => {
    const nameContext = useContext(PlayerDataContext);

    const localStore = useLocalObservable(() => ({
        nameDialogActive: false
    }));

    const onNameClick = action(() => {
        localStore.nameDialogActive = !localStore.nameDialogActive;
    });

    const navLinkStyle = { textDecoration: "none", color: "inherit" };

    return (
        <header className="site-header">
            <div className="navigation">
                <div className="navigation-item">
                    <NavLink
                        to="/"
                        activeClassName="navigation-item-active"
                        style={navLinkStyle}
                    >
                        <div className="navigation-item-content">Home</div>
                    </NavLink>
                </div>
                <div className="navigation-item">
                    <NavLink
                        to="/about"
                        activeClassName="navigation-item-active"
                        style={navLinkStyle}
                    >
                        About
                    </NavLink>
                </div>
            </div>
            <div className="user-settings">
                <div className="player-name">
                    <div onClick={onNameClick}>
                        {nameContext.name ?? "anonymous user"}
                    </div>
                    {localStore.nameDialogActive && (
                        <NameDialog
                            onSubmit={action(() => {
                                localStore.nameDialogActive = false;
                            })}
                        />
                    )}
                </div>
            </div>
        </header>
    );
});
