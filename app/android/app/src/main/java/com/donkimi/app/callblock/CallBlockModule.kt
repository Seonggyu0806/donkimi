package com.donkimi.app.callblock

import android.app.Activity
import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * JS ↔ 네이티브 브릿지.
 * - requestRole(): 이 앱을 "통화 스크리닝 앱"으로 지정해달라고 시스템에 요청 (팝업)
 * - isRoleHeld(): 현재 역할을 보유 중인지
 * - addNumber/removeNumber/getBlockedNumbers: 차단 목록 관리
 */
class CallBlockModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var rolePromise: Promise? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName() = "CallBlock"

    private fun roleManager(): RoleManager? =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q)
            reactContext.getSystemService(Context.ROLE_SERVICE) as? RoleManager
        else null

    @ReactMethod
    fun isSupported(promise: Promise) {
        promise.resolve(Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q)
    }

    @ReactMethod
    fun isRoleHeld(promise: Promise) {
        val rm = roleManager()
        promise.resolve(rm?.isRoleHeld(RoleManager.ROLE_CALL_SCREENING) ?: false)
    }

    @ReactMethod
    fun requestRole(promise: Promise) {
        val rm = roleManager()
        if (rm == null) {
            promise.resolve(false) // Android 10 미만 미지원
            return
        }
        if (rm.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)) {
            promise.resolve(true)
            return
        }
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "화면이 준비되지 않았습니다")
            return
        }
        rolePromise = promise
        val intent = rm.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING)
        activity.startActivityForResult(intent, REQUEST_ROLE)
    }

    @ReactMethod
    fun addNumber(number: String, promise: Promise) {
        promise.resolve(CallBlockStore.add(reactContext, number))
    }

    @ReactMethod
    fun removeNumber(number: String, promise: Promise) {
        promise.resolve(CallBlockStore.remove(reactContext, number))
    }

    @ReactMethod
    fun getBlockedNumbers(promise: Promise) {
        val arr = Arguments.createArray()
        CallBlockStore.getBlocked(reactContext).sorted().forEach { arr.pushString(it) }
        promise.resolve(arr)
    }

    // 역할 요청 팝업 결과 수신
    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == REQUEST_ROLE) {
            rolePromise?.resolve(resultCode == Activity.RESULT_OK)
            rolePromise = null
        }
    }

    override fun onNewIntent(intent: Intent) = Unit

    companion object {
        private const val REQUEST_ROLE = 4821
    }
}
