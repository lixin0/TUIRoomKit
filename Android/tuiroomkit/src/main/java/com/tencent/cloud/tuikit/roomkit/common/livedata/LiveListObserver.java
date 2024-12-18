package com.tencent.cloud.tuikit.roomkit.common.livedata;

import java.util.List;

public abstract class LiveListObserver<T> {
    public void onDataChanged(List<T> list) {
    }

    public void onItemChanged(int position, T item) {
    }

    public void onItemChanged(int position, T item, String modifyFlag) {
    }

    public void onItemInserted(int position, T item) {
    }

    public void onItemRemoved(int position, T item) {
    }

    public void onItemMoved(int fromPosition, int toPosition, T item) {
    }
}
